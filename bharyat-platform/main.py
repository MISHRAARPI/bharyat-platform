from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import httpx
from datetime import datetime
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from lib.llm import call_llm
import pandas as pd
from io import BytesIO
from lib.bom_parser import parse_bom
from lib.rag import ingest_document, search_similar, rag_query


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

projects_db = {}

class Project(BaseModel):
    name: str
    customer: Optional[str] = None
    product: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    customer: Optional[str] = None
    product: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "project": "Bharyat AI Platform"}

@app.post("/projects")
def create_project(project: Project):
    project_id = str(uuid.uuid4())
    new_project = {
        "id": project_id,
        "name": project.name,
        "customer": project.customer,
        "product": project.product,
        "industry": project.industry,
        "region": project.region,
        "created_at": datetime.now().isoformat()
    }
    projects_db[project_id] = new_project
    return new_project

@app.get("/projects")
def get_projects():
    return list(projects_db.values())

@app.get("/projects/{project_id}")
def get_project(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]

@app.patch("/projects/{project_id}")
def update_project(project_id: str, update: ProjectUpdate):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    project = projects_db[project_id]
    if update.name: project["name"] = update.name
    if update.customer: project["customer"] = update.customer
    if update.product: project["product"] = update.product
    if update.industry: project["industry"] = update.industry
    if update.region: project["region"] = update.region
    return project

@app.delete("/projects/{project_id}")
def delete_project(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    del projects_db[project_id]
    return {"message": "Project deleted successfully"}

@app.get("/test-llm")
async def test_llm():
    response = await call_llm(
        system_prompt="You are a component intelligence assistant.",
        user_prompt="What is a BOM? Answer in 2 sentences."
    )
    return {"response": response}

@app.post("/bom/upload")
async def upload_bom(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, .csv files allowed")
    contents = await file.read()
    result = parse_bom(contents, file.filename)
    return {
        "message": "BOM uploaded successfully",
        "filename": file.filename,
        **result
    }



@app.post("/rag/ingest")
async def ingest_bom_text(data: dict):
    """Ingest text into RAG pipeline"""
    text = data.get("text", "")
    source = data.get("source", "manual")
    doc_type = data.get("doc_type", "bom")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = ingest_document(text, source, doc_type)
    return result

@app.post("/rag/query")
async def query_rag(data: dict):
    question = data.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    result = await rag_query(question)
    return result

@app.get("/rag/stats")
async def rag_stats():
    """Get RAG pipeline stats"""
    from lib.rag import doc_chunks
    return {
        "total_chunks": len(doc_chunks),
        "sources": list(set([c["source"] for c in doc_chunks]))
    }

# In-memory BOM storage (will move to Supabase on Day 6)
bom_data = {}

@app.post("/bom/analyze")
async def analyze_bom(data: dict):
    """Store parsed BOM data and calculate cost summary"""
    bom_id = str(uuid.uuid4())
    rows = data.get("rows", [])
    
    total_cost = 0
    missing_price = 0
    
    for row in rows:
        unit_cost = float(row.get("unit_cost") or 0)
        quantity = int(row.get("quantity") or 1)
        total_cost += unit_cost * quantity
        if not unit_cost:
            missing_price += 1
    
    summary = {
        "bom_id": bom_id,
        "parts_count": len(rows),
        "total_cost": round(total_cost, 2),
        "missing_price_count": missing_price,
        "annual_cost": round(total_cost * 12, 2),
        "rows": rows
    }
    
    bom_data[bom_id] = summary
    return summary

@app.get("/bom/{bom_id}/summary")
async def get_bom_summary(bom_id: str):
    if bom_id not in bom_data:
        raise HTTPException(status_code=404, detail="BOM not found")
    s = bom_data[bom_id]
    return {
        "bom_id": bom_id,
        "parts_count": s["parts_count"],
        "total_cost": s["total_cost"],
        "annual_cost": s["annual_cost"],
        "missing_price_count": s["missing_price_count"]
    }

@app.get("/bom/{bom_id}/top-costs")
async def get_top_costs(bom_id: str, limit: int = 10):
    if bom_id not in bom_data:
        raise HTTPException(status_code=404, detail="BOM not found")
    rows = bom_data[bom_id]["rows"]
    sorted_rows = sorted(rows, key=lambda x: float(x.get("unit_cost") or 0) * int(x.get("quantity") or 1), reverse=True)
    return sorted_rows[:limit]

@app.post("/bom/{bom_id}/risk-score")
async def calculate_risk_scores(bom_id: str):
    if bom_id not in bom_data:
        raise HTTPException(status_code=404, detail="BOM not found")
    
    rows = bom_data[bom_id]["rows"]
    scored_rows = []
    high_risk = 0
    medium_risk = 0
    low_risk = 0

    for row in rows:
        score = 0
        reasons = []

        # Rule 1: Missing manufacturer +20
        if not row.get("manufacturer"):
            score += 20
            reasons.append("Missing manufacturer")

        # Rule 2: Missing unit cost +20
        if not row.get("unit_cost") or float(row.get("unit_cost") or 0) == 0:
            score += 20
            reasons.append("Missing price data")

        # Rule 3: High unit cost > $50 +10
        if float(row.get("unit_cost") or 0) > 50:
            score += 10
            reasons.append("High unit cost >$50")

        # Rule 4: EOL lifecycle +30
        lifecycle = str(row.get("lifecycle_status") or "").upper()
        if "EOL" in lifecycle:
            score += 30
            reasons.append("EOL component")
        elif "NRND" in lifecycle:
            score += 20
            reasons.append("NRND component")

        # Rule 5: High quantity single part +10
        if int(row.get("quantity") or 1) > 100:
            score += 10
            reasons.append("High quantity dependency")

        # Determine risk level
        if score >= 40:
            risk_level = "High"
            high_risk += 1
        elif score >= 20:
            risk_level = "Medium"
            medium_risk += 1
        else:
            risk_level = "Low"
            low_risk += 1

        scored_rows.append({
            **row,
            "risk_score": score,
            "risk_level": risk_level,
            "risk_reasons": reasons
        })

    # Update bom_data with risk scores
    bom_data[bom_id]["risk_scored_rows"] = scored_rows
    bom_data[bom_id]["high_risk_count"] = high_risk
    bom_data[bom_id]["medium_risk_count"] = medium_risk
    bom_data[bom_id]["low_risk_count"] = low_risk

    return {
        "bom_id": bom_id,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "total_parts": len(rows),
        "scored_rows": scored_rows[:10]
    }
@app.get("/dashboard/ai-insights")
async def get_ai_insights():
    """Get AI insights from RAG pipeline"""
    from lib.rag import rag_query, doc_chunks
    
    if not doc_chunks:
        return {"insights": [
            {"text": "Upload a BOM to get AI-powered insights.", "color": "#7a9ab5"},
        ]}
    
    questions = [
        "What are the highest risk components in the BOM?",
        "Which components have missing price data?",
        "What cost savings opportunities exist in this BOM?"
    ]
    
    insights = []
    colors = ["#ff5555", "#ffb347", "#00ff9d"]
    
    for i, question in enumerate(questions):
        result = await rag_query(question)
        answer = result["answer"].split("\n")[0]  # First line only
        # Remove CONFIDENCE part
        answer = answer.split("CONFIDENCE")[0].strip()
        insights.append({
            "text": answer,
            "color": colors[i]
        })
    
    return {"insights": insights}

@app.post("/components/alternates/score")
async def score_alternates(data: dict):
    original = data.get("original", {})
    alternates = data.get("alternates", [])
    
    scored = []
    
    for alt in alternates:
        elec_sim   = float(alt.get("electrical_similarity", 50))
        pkg_match  = float(alt.get("package_match", 50))
        cost_adv   = float(alt.get("cost_advantage", 50))
        lifecycle  = float(alt.get("lifecycle_score", 50))
        avail      = float(alt.get("availability_score", 50))
        trust      = float(alt.get("vendor_trust_score", 50))

        total_score = (
            elec_sim  * 0.35 +
            pkg_match * 0.20 +
            cost_adv  * 0.15 +
            lifecycle * 0.10 +
            avail     * 0.10 +
            trust     * 0.10
        )

        if total_score >= 70:
            risk_level = "Low"
        elif total_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "High"

        scored.append({
            "alt_mpn": alt.get("alt_mpn"),
            "alt_manufacturer": alt.get("alt_manufacturer"),
            "total_score": round(total_score, 1),
            "risk_level": risk_level,
            "breakdown": {
                "electrical_similarity": elec_sim,
                "package_match": pkg_match,
                "cost_advantage": cost_adv,
                "lifecycle_score": lifecycle,
                "availability_score": avail,
                "vendor_trust_score": trust
            },
            "validation_required": True,
            "disclaimer": "⚠ Potential candidate only — requires engineering validation before substitution"
        })

    scored.sort(key=lambda x: x["total_score"], reverse=True)

    return {
        "original_mpn": original.get("mpn"),
        "alternates_scored": scored,
        "total_alternates": len(scored)
    }

@app.post("/components/risk-explanation")
async def get_risk_explanation(data: dict):
    """Generate 2-sentence plain English risk explanation using LLM"""
    mpn = data.get("mpn", "")
    risk_score = data.get("risk_score", 0)
    risk_reasons = data.get("risk_reasons", [])
    
    system_prompt = "You are a component risk analyst. Give exactly 2 sentences explaining the risk. Be concise and clear."
    
    user_prompt = f"""Component: {mpn}
Risk Score: {risk_score}/100
Risk Reasons: {', '.join(risk_reasons) if risk_reasons else 'None identified'}

Give exactly 2 sentences explaining this risk level in plain English for a procurement engineer."""

    explanation = await call_llm(system_prompt, user_prompt)
    
    return {
        "mpn": mpn,
        "risk_score": risk_score,
        "explanation": explanation,
        "validation_required": True
    }

