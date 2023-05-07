import pytest
import os
import sys
from io import BytesIO
from PIL import Image
import json
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)
from app import app
from app import create_app
from app import db 
from db import database

global token

@pytest.fixture(scope="session")
def client():
    app = create_app()
    with app.app_context():
        database.create_all()
        with app.test_client() as client:
            yield client
        database.session.close()
        database.drop_all()
    
def test_create_user_success(client):
    response = client.post("/u/create", json={
        "username": "test",
        "password": "test"
    })
    assert response.status_code == 200

def test_create_user_fail_already_exist(client):
    response = client.post("/u/create", json={
        "username": "test",
        "password": "test"
    })
    assert response.status_code == 400
    assert "error" in response.get_json()

def test_create_user_fail_no_data(client):
    response = client.post("/u/create", json={
    })
    assert response.status_code == 400

def test_login_user_success(client):
    response = client.post("/u/login", json={
        "username": "test",
        "password": "test"
    })
    assert response.status_code == 200
    # Get the token from the response
    global token
    token = response.get_data(as_text=True)

def test_login_user_fail_incorrect_pass(client):
    response = client.post("/u/login", json={
        "username": "test",
        "password": "wrong"
    })
    assert response.status_code == 401

def test_login_user_fail_no_user(client):
    response = client.post("/u/login", json={
        "username": "wrong",
        "password": "test"
    })
    assert response.status_code == 404

def test_login_user_fail_no_data(client):
    response = client.post("/u/login", json={
    })
    assert response.status_code == 400

def test_get_user_success(client):
    response = client.get("/u/1")
    assert response.status_code == 200
    assert "username" in response.get_json()
    assert "password" not in response.get_json()

def test_get_user_fail_no_user(client):
    response = client.get("/u/wrong")
    assert response.status_code == 404

def test_get_user_fail_no_data(client):
    response = client.get("/u/")
    assert response.status_code == 404

def test_get_user_by_username_success(client):
    response = client.get("/u/test/info")
    assert response.status_code == 200
    assert "username" in response.get_json()
    assert "password" not in response.get_json()

def test_get_user_by_username_fail_no_user(client):
    response = client.get("/u/wrong/info")
    assert response.status_code == 404

def test_get_user_by_username_fail_no_data(client):
    response = client.get("/u//info")
    assert response.status_code == 404

def test_get_user_posts_success(client):
    response = client.get("/u/1/posts/1")
    assert response.status_code == 200
    assert "posts" in response.get_json()

def test_get_user_posts_fail_no_user(client):
    response = client.get("/u/2/posts/1")
    assert response.status_code == 200
    assert response.get_json()["pages"] == 0


def test_get_user_comments_success(client):
    response = client.get("/u/1/comments/1")
    assert response.status_code == 200
    assert "comments" in response.get_json()

def test_get_user_comments_fail_no_user(client):
    response = client.get("/u/2/comments/1")
    assert response.status_code == 200
    assert response.get_json()["pages"] == 0

def test_create_community_success(client):
    response = client.post("/c/create", json={
        "name": "test",
        "description": "test",
    }, headers= {"Authorization": token})
    assert response.status_code == 200

def test_create_community_fail_already_exist(client):
    response = client.post("/c/create", json={
        "name": "test",
        "description": "test",
    }, headers= {"Authorization": token})
    assert response.status_code == 400
    assert "error" in response.get_json()

def test_create_community_fail_no_data(client):
    response = client.post("/c/create", json={
    }, headers= {"Authorization": token})
    assert response.status_code == 400

def test_get_all_community_success(client):
    response = client.get("/c/get")
    assert response.status_code == 200

def test_get_joined_community_success(client):
    response = client.get("/c/joined", headers={"Authorization": token})
    assert response.status_code == 200

def test_get_community_by_name_success(client):
    response = client.get("/c/get/test")
    assert response.status_code == 200
    assert "name" in response.get_json()

def test_get_community_by_name_fail_no_community(client):
    response = client.get("/c/get/wrong")
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_get_community_by_id_success(client):
    response = client.get("/c/info/1")
    assert response.status_code == 200
    assert "name" in response.get_json()

def test_get_community_by_id_fail_no_community(client):
    response = client.get("/c/info/2")
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_leave_community_success(client):
    response = client.post("/c/leave",json = {"id" : "1"} , headers={"Authorization": token})
    assert response.status_code == 200

def test_join_community_success(client):
    response = client.post("/c/join",json = {"id" : "1"} , headers={"Authorization": token})
    assert response.status_code == 200

def test_join_community_fail_no_community(client):
    response = client.post("/c/join",json = {"id" : "2"} , headers={"Authorization": token})
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_join_community_fail_no_data(client):
    response = client.post("/c/join", json = {"id" : ""} , headers={"Authorization": token})
    assert response.status_code == 400

def test_leave_community_fail_no_community(client):
    response = client.post("/c/leave",json = {"id" : "2"} , headers={"Authorization": token})
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_leave_community_fail_no_data(client):
    response = client.post("/c/leave", json = {"id" : ""} , headers={"Authorization": token})
    assert response.status_code == 400

def test_get_community_posts_success(client):
    response = client.get("/c/1/posts/1")
    assert response.status_code == 200
    assert "posts" in response.get_json()

def test_get_community_posts_fail_no_community(client):
    response = client.get("/c/2/posts/1")
    assert response.status_code == 200
    assert response.get_json()["pages"] == 0

def test_create_post_success(client):
    response = client.post("/p/create", json={
        "title": "test",
        "content": "test",
        "community_id": "1"
    }, headers= {"Authorization": token})
    assert response.status_code == 200
    assert "id" in response.get_json()

def test_create_post_fail_no_data(client):
    response = client.post("/p/create", json={
    }, headers= {"Authorization": token})
    assert response.status_code == 400

def test_get_post_success(client):
    response = client.get("/p/1")
    assert response.status_code == 200
    assert "title" in response.get_json()

def test_get_post_fail_no_post(client):
    response = client.get("/p/2")
    assert response.status_code == 404

def test_update_post_success(client):
    response = client.post("/p/update",json = {
        "id" : "1",
        "title" : "test2",
        "content" : "test2"
    } , headers={"Authorization": token})
    assert response.status_code == 200

def test_update_post_fail_no_post(client):
    response = client.post("/p/update",json = {
        "id" : "2",
        "title" : "test2",
        "content" : "test2"
    } , headers={"Authorization": token})
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_upvote_post_success(client):
    response = client.post("/p/1/upvote",headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/p/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]    
    assert vote_count == 1
    response = client.post("/p/1/upvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/p/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == 0

def test_upvote_post_fail_no_post(client):
    response = client.post("/p/2/upvote",headers={"Authorization": token})
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_downvote_post_success(client):
    response = client.post("/p/1/downvote",headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/p/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]    
    assert vote_count == -1
    response = client.post("/p/1/downvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/p/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == 0

def test_upvote_downvote_success(client):
    response = client.post("/p/1/upvote",headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/p/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]    
    assert vote_count == 1
    response = client.post("/p/1/downvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/p/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == -1
    response = client.post("/p/1/upvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/p/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == 1

def test_create_comment_success(client):
    response = client.post("/cm/create", json={
        "content": "test",
        "post": "1"
    }, headers= {"Authorization": token})
    assert response.status_code == 200

def test_create_comment_fail_no_data(client):
    response = client.post("/cm/create", json={
    }, headers= {"Authorization": token})
    assert response.status_code == 400

def test_complete_comment_success(client):
    response = client.post("/cm/completion", json={
        "content": "test",
        "post": "1"
    }, headers= {"Authorization": token})
    assert response.status_code == 200
    assert "completion" in response.get_json()

def test_get_comment_replies_success(client):
    response = client.get("/cm/1/replies")
    assert response.status_code == 200

def test_get_comment_parent_success(client):
    response = client.get("/cm/1/parent")
    assert response.status_code == 200
    assert "post" in response.get_json()
    assert "comment" in response.get_json()

def test_get_comment_parent_fail_no_comment(client):
    response = client.get("/cm/2/parent")
    assert response.status_code == 404

def test_upvote_comment(client):
    response = client.post("/cm/1/upvote",headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/cm/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]    
    assert vote_count == 1
    response = client.post("/cm/1/upvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/cm/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == 0

def test_downvote_comment(client):
    response = client.post("/cm/1/downvote",headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/cm/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]    
    assert vote_count == -1
    response = client.post("/cm/1/downvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/cm/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == 0

def test_upvote_downvote_comment(client):
    response = client.post("/cm/1/upvote",headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/cm/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]    
    assert vote_count == 1
    response = client.post("/cm/1/downvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/cm/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == -1
    response = client.post("/cm/1/upvote", headers={"Authorization": token})
    assert response.status_code == 200
    response2 = client.get("/cm/1/vote", headers={"Authorization": token})
    assert response2.status_code == 200
    vote_count = json.loads(response2.get_data(as_text=True))["vote"]
    assert vote_count == 1

def test_get_comment_info(client):
    response = client.get("/cm/1/info")
    assert response.status_code == 200
    assert "content" in response.get_json()
    assert "post" in response.get_json()


def test_get_comment_info_fail_no_comment(client):
    response = client.get("/cm/2/info")
    assert response.status_code == 404

def test_get_me_info(client):
    response = client.get("/me/info", headers={"Authorization": token})
    assert response.status_code == 200
    assert "username" in response.get_json()

def test_get_me_info_fail_no_auth(client):
    response = client.get("/me/info")
    assert response.status_code == 401

def test_update_me_info(client):
    response = client.post("/me/update", json={
        "username": "test3",
    }, headers={"Authorization": token})
    assert response.status_code == 200

def test_get_me_communities(client):
    response = client.get("/me/communities", headers={"Authorization": token})
    assert response.status_code == 200

def test_get_me_feed(client):
    response = client.get("/me/feed", headers={"Authorization": token})
    assert response.status_code == 200    

def test_upload_me_pic(client):
    image = Image.new('RGB', (100, 100))
    file = BytesIO()
    image.save(file, 'png')
    file.name = 'test.png'
    file.seek(0)
    response = client.post("/me/pic", data={"file": file}, headers={"Authorization": token})
    assert response.status_code == 200

def test_change_me_password(client):
    response = client.post("/me/password", json={
        "old_password": "test",
        "new_password": "test2"
    }, headers={"Authorization": token})
    assert response.status_code == 200

def test_change_me_password_fail_wrong_pass(client):
    response = client.post("/me/password", json={
        "old_password": "test",
        "new_password": "test3"
    }, headers={"Authorization": token})
    assert response.status_code == 400

def test_search_with_valid_query(client):
    response = client.get('/search?q=test')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "users" in data
    assert "communities" in data

def test_search_with_invalid_query(client):
    response = client.get('/search')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data

def test_search_posts_with_valid_query(client):
    response = client.get('/search-posts?q=test')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "posts" in data
    assert "comments" in data

def test_search_posts_with_invalid_query(client):
    response = client.get('/search-posts')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data


def test_trending(client):
    response = client.get('/trending')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) <= 20

def test_delete_user_post(client):
    response = client.post("/p/1/delete", headers={"Authorization": token})
    assert response.status_code == 200





        
