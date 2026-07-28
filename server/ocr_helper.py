import sys
import json
import re

def parse_timetable_text(raw_text):
    """
    Parses OCR text output and extracts Timetable slots:
    - Days: Monday - Saturday
    - Time ranges: 09:00 AM - 09:50 AM
    - Subject Codes / Names: DSTL, DLD, WDW, Python, CO, Math, DS
    """
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    time_pattern = re.compile(r'(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–to]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))', re.IGNORECASE)
    
    extracted_slots = []
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    
    current_day = 'Monday'
    
    for line in lines:
        # Check day marker
        for d in days:
            if d.lower() in line.lower():
                current_day = d
                break
        
        # Check time match
        time_match = time_pattern.search(line)
        if time_match:
            time_range = f"{time_match.group(1).upper()} - {time_match.group(2).upper()}"
            # Extract subject text by removing the time string
            subject_text = time_pattern.sub('', line).strip()
            if not subject_text or len(subject_text) < 2:
                subject_text = "General Lecture"
            
            extracted_slots.append({
                'day': current_day,
                'time': time_range,
                'subject': subject_text
            })
            
    return extracted_slots

if __name__ == '__main__':
    if len(sys.argv) > 1:
        text_input = sys.argv[1]
        result = parse_timetable_text(text_input)
        print(json.dumps({'success': True, 'slots': result}))
    else:
        print(json.dumps({'success': False, 'message': 'No input text provided'}))
