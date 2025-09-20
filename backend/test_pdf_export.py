#!/usr/bin/env python3
import requests
import json

def test_pdf_export():
    # Get a resume ID first
    print("Fetching resume list...")
    response = requests.get('http://localhost:8000/api/resumes/')
    
    if response.status_code != 200:
        print(f"Error fetching resumes: {response.status_code}")
        return
    
    data = response.json()
    if not data['results']:
        print("No resumes found to test with")
        return
    
    resume_id = data['results'][0]['id']
    print(f"Using resume ID: {resume_id}")
    
    # Test PDF export
    print("Testing PDF export endpoint...")
    pdf_response = requests.post(
        f'http://localhost:8000/api/resumes/{resume_id}/export_pdf/',
        headers={'Content-Type': 'application/json'}
    )
    
    if pdf_response.status_code == 200:
        with open('resume_python_test.pdf', 'wb') as f:
            f.write(pdf_response.content)
        print(f"✅ PDF generated successfully!")
        print(f"   File size: {len(pdf_response.content)} bytes")
        print(f"   Content-Type: {pdf_response.headers.get('Content-Type', 'Unknown')}")
        print(f"   Saved as: resume_python_test.pdf")
    else:
        print(f"❌ Error: {pdf_response.status_code}")
        print(f"   Response: {pdf_response.text}")

if __name__ == "__main__":
    test_pdf_export()
