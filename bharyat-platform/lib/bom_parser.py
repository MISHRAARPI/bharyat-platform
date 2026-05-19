import re
import pandas as pd
from io import BytesIO

def normalize_mpn(mpn: str) -> str:
    """Normalize MPN - strip spaces, uppercase, remove common suffixes"""
    if not mpn:
        return ''
    mpn = str(mpn).strip().upper()
    # Remove common packaging suffixes
    mpn = re.sub(r'[-/](PWR|TR|G|T|ND|CT|SMD|SMT)$', '', mpn)
    # Remove extra spaces
    mpn = re.sub(r'\s+', '', mpn)
    return mpn

def parse_bom(contents: bytes, filename: str) -> dict:
    """Parse BOM Excel/CSV file and return normalized data"""
    
    # Read file
    if filename.endswith('.csv'):
        df = pd.read_csv(BytesIO(contents))
    else:
        df = pd.read_excel(BytesIO(contents))
    
    # Fuzzy column mapping
    column_map = {}
    for col in df.columns:
        col_lower = col.lower().strip()
        if any(x in col_lower for x in ['mpn', 'part no', 'part number', 'pn', 'component']):
            column_map['mpn'] = col
        elif any(x in col_lower for x in ['qty', 'quantity', 'count']):
            column_map['quantity'] = col
        elif any(x in col_lower for x in ['desc', 'description', 'name']):
            column_map['description'] = col
        elif any(x in col_lower for x in ['mfr', 'manufacturer', 'vendor']):
            column_map['manufacturer'] = col
        elif any(x in col_lower for x in ['cost', 'price', 'unit']):
            column_map['unit_cost'] = col

    # Extract rows
    mpn_col = column_map.get('mpn', df.columns[0])
    rows = []
    seen_mpns = {}
    duplicates = []

    for _, row in df.iterrows():
        raw_mpn = str(row.get(mpn_col, '')).strip()
        if not raw_mpn or raw_mpn == 'nan' or raw_mpn == 'MPN':
            continue
        
        canonical = normalize_mpn(raw_mpn)
        
        # Check duplicate
        is_duplicate = canonical in seen_mpns
        if is_duplicate:
            duplicates.append(canonical)
        else:
            seen_mpns[canonical] = True

        row_data = {
            'raw_mpn': raw_mpn,
            'canonical_mpn': canonical,
            'quantity': row.get(column_map.get('quantity'), 1),
            'description': row.get(column_map.get('description'), ''),
            'manufacturer': row.get(column_map.get('manufacturer'), ''),
            'unit_cost': row.get(column_map.get('unit_cost'), 0),
            'is_duplicate': is_duplicate,
        }
        rows.append(row_data)

    return {
        'total_rows': len(rows),
        'columns_detected': column_map,
        'duplicates_found': len(duplicates),
        'duplicate_mpns': duplicates,
        'rows': rows,
        'mpns_preview': [r['canonical_mpn'] for r in rows[:10]]
    }