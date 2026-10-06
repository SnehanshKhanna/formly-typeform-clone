import requests
import time
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    try:
        # Wait for server
        for _ in range(5):
            try:
                requests.get(f"{BASE_URL}/health")
                break
            except:
                time.sleep(1)
                
        # 1. Health check
        res = requests.get(f"{BASE_URL}/health")
        assert res.status_code == 200, "Health check failed"
        print("Health check OK")
        
        # 2. Form CRUD
        res = requests.post(f"{BASE_URL}/forms", json={"title": "Smoke Test Form"})
        assert res.status_code == 201, "Form create failed"
        form = res.json()
        form_id = form["id"]
        print(f"Form created: {form_id}")
        
        # 3. Question CRUD
        res = requests.post(f"{BASE_URL}/forms/{form_id}/questions", json={
            "type": "short_text",
            "title": "What is your name?"
        })
        assert res.status_code == 201, "Question create failed"
        q1 = res.json()
        print(f"Question created: {q1['id']}")
        
        res = requests.post(f"{BASE_URL}/forms/{form_id}/questions", json={
            "type": "multiple_choice",
            "title": "Pick one",
            "options": [{"label": "A"}, {"label": "B"}]
        })
        assert res.status_code == 201
        q2 = res.json()
        print("Question 2 created")
        
        # 4. Publish
        res = requests.post(f"{BASE_URL}/forms/{form_id}/publish")
        assert res.status_code == 200, f"Publish failed: {res.text}"
        published = res.json()
        slug = published["slug"]
        print(f"Form published, slug: {slug}")
        
        # 5. Public published-form retrieval
        res = requests.get(f"{BASE_URL}/public/forms/{slug}")
        assert res.status_code == 200, "Public get failed"
        print("Public GET OK")
        
        # 6. Public draft/non-existent slug behavior
        res = requests.get(f"{BASE_URL}/public/forms/non-existent-slug-123")
        assert res.status_code == 404
        # Unpublish
        requests.post(f"{BASE_URL}/forms/{form_id}/unpublish")
        res = requests.get(f"{BASE_URL}/public/forms/{slug}")
        assert res.status_code == 404
        print("Public draft/non-existent OK")
        
        # Publish again for submission
        requests.post(f"{BASE_URL}/forms/{form_id}/publish")
        
        # 7. Submission
        ans_data = {
            "answers": [
                {"question_id": q1["id"], "value": "Smoke User"},
                {"question_id": q2["id"], "value": [q2["options"][0]["id"]]}
            ]
        }
        res = requests.post(f"{BASE_URL}/public/forms/{slug}/submissions", json=ans_data)
        assert res.status_code == 201, f"Submission failed: {res.text}"
        print("Submission OK")
        
        # 8. Stats/results
        res = requests.get(f"{BASE_URL}/forms/{form_id}/stats")
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_submissions"] == 1
        print("Stats OK")
        
        # 10. Cascade behavior
        res = requests.delete(f"{BASE_URL}/forms/{form_id}")
        assert res.status_code == 204
        res = requests.get(f"{BASE_URL}/forms/{form_id}")
        assert res.status_code == 404
        print("Cascade / Delete OK")
        
        print("All smoke tests passed!")
    except Exception as e:
        print(f"Smoke test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
