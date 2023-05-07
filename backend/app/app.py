from datetime import datetime
from functools import wraps
from random import randint
import os


from bcrypt import hashpw, gensalt, checkpw
from flask import Flask, abort, jsonify, request, send_from_directory
from flask_cors import CORS
from sqlalchemy import or_
from marshmallow import ValidationError
from jwt import encode, decode
from PIL import Image
import openai

import db
from db import database
import schema

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'app/uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

dbuser = os.environ.get("DBUSER")
dbpass = os.environ.get("DBPASS")

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://"+dbuser+":"+dbpass+"@localhost:3306/cop"

secret = os.environ.get("SECRET")
openai.api_key = os.environ.get("OPENAI_API_KEY")
openai.Model.retrieve("text-davinci-003")

# cron = Scheduler(daemon=True)
# cron.start()

# atexit.register(lambda: cron.shutdown(wait=False))


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in set(
               ['png', 'jpg', 'jpeg', 'gif'])

# ----------------------------
# SCHEMA
# ----------------------------


def authorize(f):
    @wraps(f)
    def decorated_function(*args, **kws):
        if not 'Authorization' in request.headers:
            print("no auth header")
            abort(401)
        user = None
        data = request.headers['Authorization']
        token = str.replace(str(data), 'Bearer ', '')
        try:
            user = decode(token, secret, algorithms=['HS256'])
        except:
            abort(401)

        return f(user=user, *args, **kws)
    return decorated_function


def weak_authorize(f):
    @wraps(f)
    def decorated_function(*args, **kws):
        if not 'Authorization' in request.headers:
            print("no auth header")
            abort(401)
        user = None
        data = request.headers['Authorization']
        token = str.replace(str(data), 'Bearer ', '')
        try:
            user = decode(token, secret, algorithms=['HS256'])
        except:
            print("weakkk")

        return f(user=user, *args, **kws)
    return decorated_function


def upload_file(f):
    @wraps(f)
    def decorated_function(*args, **kws):
        if 'file' not in request.files:
            print('No file part')
            abort(400)
        file = request.files['file']
        if file.filename == '':
            print('No selected file')
            abort(400)
        if file and allowed_file(file.filename):
            im = Image.open(file)
            im.thumbnail((500, 500))
            filename = rand_str() + '.' + im.format.lower()
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            im.save(path, im.format)
            return f(filename=filename, *args, **kws)

    return decorated_function

# delete those files which are not used


def delete_old_file():
    dps = database.session.query(db.User.display_pic).all()
    cpics = database.session.query(db.Community.display_pic).all()
    alll = os.listdir(app.config['UPLOAD_FOLDER'])
    used = set([x[0] for x in dps] + [x[0] for x in cpics])
    for f in alll:
        if f not in used:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], f))


def rand_str(len=16):
    return ''.join([chr(randint(97, 122)) for i in range(len)])

# regularly call this function to delete old files
# @cron.scheduled_job('interval', minutes=10)
# def timed_job():
#     delete_old_file()

# ----------------------------
# USERS
# ----------------------------


@app.route("/u/create", methods=["POST"])
def register():
    b = request.get_json()
    try:
        schema.register_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    b["username"] = b["username"].strip()
    if (b["username"] == ""):
        return {"error": "Username cannot be empty"}, 400
    user = database.session.query(db.User).filter_by(
        username=b["username"]).first()
    if user:
        return {"error": "Username already exists"}, 400
    hashed = hashpw(b["password"].encode("utf-8"), gensalt())
    user = db.User(username=b["username"], password=hashed,
                   display_pic=b["display_pic"] if "display_pic" in b else None)
    database.session.add(user)
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/u/login", methods=["POST"])
def login():
    b = request.get_json()
    try:
        schema.login_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    user = database.session.query(db.User).filter_by(
        username=b["username"]).first()
    if user is None:
        return "User not found", 404
    if checkpw(b["password"].encode("utf-8"), user.password.encode("utf-8")):
        j = {"id": user.id}
        jj = encode(j, secret, algorithm="HS256")
        print(jj)
        return jj, 200
    return {"error": "Incorrect password"}, 401


@app.route("/u/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = database.session.query(db.User).filter_by(id=user_id).first()
    if user is None:
        return "User not found", 404
    user_schema = schema.UserSchema()
    return jsonify(user_schema.dump(user)), 200


@app.route("/u/<string:username>/info", methods=["GET"])
def get_user_info(username):
    user = database.session.query(db.User).filter_by(username=username).first()
    if user is None:
        return "User not found", 404
    user_schema = schema.UserSchema()
    return jsonify(user_schema.dump(user)), 200


@app.route("/u/<int:user_id>/posts/<int:pagenum>", methods=["GET"])
def get_user_posts(user_id, pagenum):
    count = database.session.query(db.Post).filter_by(user_id=user_id).count()
    posts = database.session.query(db.Post).filter_by(user_id=user_id).order_by(
        db.Post.id.desc()).limit(10).offset(pagenum * 10).all()
    posts_schema = schema.PostSchema(many=True)
    pages = count // 10 + (1 if count % 10 > 0 else 0)
    return jsonify({"pages": pages, "posts": posts_schema.dump(posts)}), 200


@app.route("/u/<int:user_id>/comments/<int:pagenum>", methods=["GET"])
def get_user_comments(user_id, pagenum):
    count = database.session.query(
        db.Comment).filter_by(user_id=user_id).count()
    comments = database.session.query(db.Comment).filter_by(user_id=user_id).order_by(
        db.Comment.id.desc()).limit(10).offset(pagenum * 10).all()
    comments_schema = schema.CommentSchema(many=True)
    pages = count // 10 + (1 if count % 10 > 0 else 0)
    return jsonify({"pages": pages, "comments": comments_schema.dump(comments)}), 200


# ----------------------------
# POSTS
# ----------------------------


@app.route("/p/create", methods=["POST"])
@authorize
def create_post(user=None):
    b = request.get_json()
    try:
        schema.create_post_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    b["title"] = b["title"].strip()
    if (b["title"] == ""):
        return {"error": "Title cannot be empty"}, 400
    subbed  = database.session.query(db.SubscribedCommunity).filter_by(
        user_id=user["id"], community_id=b["community_id"]).first()
    if subbed is None:
        return {"error": "You are not subscribed to this community"}, 400
    post = db.Post(
        title=b["title"],
        content=b["content"],
        user_id=user["id"],
        community_id=b["community_id"],
        display_pic=b["display_pic"] if "display_pic" in b else None,
    )
    database.session.add(post)
    database.session.commit()
    return {"id": post.id}, 200


@app.route("/p/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = database.session.query(db.Post).filter_by(id=post_id).first()
    if post is None:
        return "Post not found", 404
    post_schema = schema.PostSchema()
    return jsonify(post_schema.dump(post)), 200


@app.route("/p/<int:post_id>/comments", methods=["GET"])
def get_post_comments(post_id):
    comments = database.session.query(
        db.Comment).filter_by(post_id=post_id, parent_comment=None).order_by(db.Comment.id.desc()).all()
    comments_schema = schema.CommentSchema(many=True)
    return jsonify(comments_schema.dump(comments)), 200


@app.route("/p/update", methods=["POST"])
@authorize
def update_post(user=None):
    b = request.get_json()
    try:
        schema.update_post_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    post = database.session.query(db.Post).filter_by(id=b["id"]).first()
    if post is None:
        return {"error": "Post not found"}, 404
    subbed = database.session.query(db.SubscribedCommunity).filter_by(
        user_id=user["id"], community_id=post.community_id).first()
    if subbed is None:
        return {"error": "You are not subscribed to this community"}, 400
  
    b["title"] = b["title"].strip()
    if (b["title"] == ""):
        return {"error": "Title cannot be empty"}, 400
    post.title = b["title"]
    post.content = b["content"]
    post.display_pic = b["display_pic"] if "display_pic" in b else None
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/p/<int:post_id>/upvote", methods=["POST"])
@authorize
def upvote_post(post_id, user=None):
    post = database.session.query(db.Post).filter_by(id=post_id).first()
    if post is None:
        return {"error": "Post not found"}, 404
    vote = database.session.query(db.Vote).filter_by(
        user_id=user["id"], post_id=post_id).first()
    if vote is not None:
        if vote.upvote:
            database.session.delete(vote)
            post.upvotes -= 1
            database.session.add(post)
            database.session.commit()
        else:
            vote.upvote = True
            post.upvotes += 1
            post.downvotes -= 1
            database.session.add(post)
            database.session.add(vote)
            database.session.commit()
    else:
        upvote = db.Vote(user_id=user["id"], post_id=post_id, upvote=True)
        post.upvotes += 1
        database.session.add(post)
        database.session.add(upvote)
        database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/p/<int:post_id>/downvote", methods=["POST"])
@authorize
def downvote_post(post_id, user=None):
    post = database.session.query(db.Post).filter_by(id=post_id).first()
    if post is None:
        return "Post not found", 404
    vote = database.session.query(db.Vote).filter_by(
        user_id=user["id"], post_id=post_id).first()
    if vote is not None:
        if vote.upvote:
            vote.upvote = False
            post.upvotes -= 1
            post.downvotes += 1
            database.session.add(post)
            database.session.add(vote)
            database.session.commit()
        else:
            database.session.delete(vote)
            post.downvotes -= 1
            database.session.add(post)
            database.session.commit()
    else:
        downvote = db.Vote(user_id=user["id"], post_id=post_id, upvote=False)
        post.downvotes += 1
        database.session.add(post)
        database.session.add(downvote)
        database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/p/<int:post_id>/vote", methods=["GET"])
@authorize
def get_post_vote(post_id, user=None):
    vote = database.session.query(db.Vote).filter_by(
        user_id=user["id"], post_id=post_id).first()
    if vote is None:
        return '{"vote": 0}', 200
    if vote.upvote:
        return '{"vote": 1}', 200
    else:
        return '{"vote": -1}', 200
    
@app.route("/p/<int:post_id>/delete", methods=["POST"])
@authorize
def delete_post(post_id, user=None):
    post = database.session.query(db.Post).filter_by(id=post_id).first()
    if post is None:
        return "Post not found", 404
    if post.user_id != user["id"]:
        return "Unauthorized", 401
    database.session.delete(post)
    database.session.commit()
    return '{"status": "OK"}', 200


# ----------------------------
# COMMUNITIES
# ----------------------------


@app.route("/c/create", methods=["POST"])
@authorize
def create_community(user=None):
    b = request.get_json()
    try:
        schema.create_community_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    b["name"] = b["name"].strip()
    if len(b["name"]) == 0:
        return {"error": "Community name cannot be empty"}, 400
    existing = database.session.query(
        db.Community).filter_by(name=b["name"]).first()
    if existing:
        return {"error": "Community already exists"}, 400
    community = db.Community(
        name=b["name"], description=b["description"], display_pic=b["display_pic"] if "display_pic" in b else None,
        created_by_id=user["id"], admin_id=user["id"]
    )
    database.session.add(community)
    database.session.commit()
    subscribed = db.SubscribedCommunity(
        user_id=user["id"], community_id=community.id)
    database.session.add(subscribed)
    database.session.commit()
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/c/get", methods=["GET"])
def get_communities():
    communities = database.session.query(db.Community).all()
    communities_schema = schema.CommunitySchema(many=True)
    return jsonify(communities_schema.dump(communities)), 200


@app.route("/c/joined", methods=["GET"])
@authorize
def get_joined_communities(user=None):
    joined = database.session.query(db.Community).join(db.SubscribedCommunity).filter(
        db.SubscribedCommunity.user_id == user["id"]).all()
    communities_schema = schema.CommunitySchema(many=True)
    return jsonify(communities_schema.dump(joined)), 200


@app.route("/c/get/<string:name>", methods=["GET"])
def get_community(name):
    community = database.session.query(
        db.Community).filter_by(name=name).first()
    if community is None:
        return {"error": "Community not found"}, 404
    community_schema = schema.CommunitySchema()
    return jsonify(community_schema.dump(community)), 200


@app.route("/c/info/<int:community_id>", methods=["GET"])
def get_community_info(community_id):
    community = database.session.query(db.Community).get(community_id)
    if community is None:
        return {"error": "Community not found"}, 404
    community_schema = schema.CommunitySchema()
    return jsonify(community_schema.dump(community)), 200


@app.route("/c/join", methods=["POST"])
@authorize
def join_community(user=None):
    b = request.get_json()
    try:
        schema.join_community_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    community = database.session.query(db.Community).get(b["id"])
    if community is None:
        return {"error": "Community not found"}, 404
    already_subscribed = database.session.query(db.SubscribedCommunity).filter_by(
        user_id=user["id"], community_id=b["id"]).first()
    if already_subscribed is not None:
        return {"error": "Already subscribed"}, 400
    subscribed = db.SubscribedCommunity(
        user_id=user["id"], community_id=b["id"])
    database.session.add(subscribed)
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/c/leave", methods=["POST"])
@authorize
def leave_community(user=None):
    b = request.get_json()
    try:
        schema.join_community_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    community = database.session.query(db.Community).get(b["id"])
    if community is None:
        return {"error": "Community not found"}, 404
    subscribed = database.session.query(db.SubscribedCommunity).filter_by(
        user_id=user["id"], community_id=b["id"]).first()
    if subscribed is None:
        return {"error": "Not subscribed"}, 400
    database.session.delete(subscribed)
    database.session.commit()
    return '{"status": "OK"}', 200



@app.route("/c/<int:community_id>/posts/<int:pagenum>", methods=["GET"])
def get_community_posts(community_id, pagenum):
    count = database.session.query(db.Post).filter_by(
        community_id=community_id).count()
    posts = database.session.query(db.Post).filter_by(community_id=community_id).order_by(
        db.Post.id.desc()).limit(10).offset(pagenum * 10).all()
    posts_schema = schema.PostSchema(many=True)
    pages = count // 10 + (1 if count % 10 > 0 else 0)
    return jsonify({"pages": pages, "posts": posts_schema.dump(posts)}), 200


# ----------------------------
# COMMENTS
# ----------------------------


@app.route("/cm/create", methods=["POST"])
@authorize
def create_comment(user=None):
    b = request.get_json()
    if not ("post" in b) :
        if not ("parent" in b):
            return {"error": "Post or parent comment not specified"}, 400
        par = database.session.query(db.Comment).get(b["parent"])
        b["post"] = par.post_id
    try:
        schema.create_comment_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    comment = db.Comment(
        content=b["content"],
        user_id=user["id"],
        post_id=b["post"],
        parent_comment=b["parent"] if "parent" in b else None
    )
    database.session.add(comment)
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/cm/completion", methods=["POST"])
@authorize
def complete_comment(user=None):
    b = request.get_json()
    try:
        schema.create_comment_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    gpt_response = openai.Completion.create(
        engine="davinci",
        prompt=b["content"],
        max_tokens=100,
        top_p=1,
        temperature=0.7,
        frequency_penalty=0.5,
        presence_penalty=0.5,
        stop=[".", "!", "?"]
    )
    resp = gpt_response["choices"][0]["text"]
    # remove everything before <REPLY>
    return jsonify({"completion": resp}), 200


@app.route("/cm/<int:comment_id>/replies", methods=["GET"])
def get_comment_replies(comment_id):
    replies = database.session.query(db.Comment).filter_by(
        parent_comment=comment_id).all()
    comments_schema = schema.CommentSchema(many=True)
    return jsonify(comments_schema.dump(replies)), 200


@app.route("/cm/<int:comment_id>/parent", methods=["GET"])
def get_comment_parent(comment_id):
    comment = database.session.query(db.Comment).get(comment_id)
    if comment is None:
        return "Comment not found", 404
    parent = database.session.query(db.Comment).get(comment.parent_comment)
    comment_schema = schema.CommentSchema()
    post = database.session.query(db.Post).filter_by(
        id=comment.post_id).first()
    post_schema = schema.PostSchema()

    return {
        "comment": comment_schema.dump(parent) if parent else None,
        "post": post_schema.dump(post)
    }, 200


@app.route("/cm/<int:comment_id>/upvote", methods=["POST"])
@authorize
def upvote_comment(comment_id, user=None):
    comment = database.session.query(
        db.Comment).filter_by(id=comment_id).first()
    if comment is None:
        return "Comment not found", 404
    vote = database.session.query(db.CommentVote).filter_by(
        comment_id=comment_id, user_id=user["id"]).first()
    if vote is None:
        votee = db.CommentVote(
            comment_id=comment_id, user_id=user["id"], is_upvote=True)
        comment.upvotes += 1
        database.session.add(votee)
        database.session.add(comment)
        database.session.commit()
    elif vote.is_upvote:
        database.session.delete(vote)
        comment.upvotes -= 1
        database.session.add(comment)
        database.session.commit()
    else:
        vote.is_upvote = True
        comment.upvotes += 1
        comment.downvotes -= 1
        database.session.add(vote)
        database.session.add(comment)
        database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/cm/<int:comment_id>/downvote", methods=["POST"])
@authorize
def downvote_comment(comment_id, user=None):
    comment = database.session.query(
        db.Comment).filter_by(id=comment_id).first()
    if comment is None:
        return "Comment not found", 404
    vote = database.session.query(db.CommentVote).filter_by(
        comment_id=comment_id, user_id=user["id"]).first()
    if vote is None:
        votee = db.CommentVote(
            comment_id=comment_id, user_id=user["id"], is_upvote=False)
        comment.downvotes += 1
        database.session.add(votee)
        database.session.add(comment)
        database.session.commit()
    elif vote.is_upvote:
        vote.is_upvote = False
        comment.upvotes -= 1
        comment.downvotes += 1
        database.session.add(vote)
        database.session.add(comment)
        database.session.commit()
    else:
        database.session.delete(vote)
        comment.downvotes -= 1
        database.session.add(comment)
        database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/cm/<int:comment_id>/vote", methods=["GET"])
@weak_authorize
def vote_comment(comment_id, user=None):
    comment = database.session.query(db.Comment).get(comment_id)
    if comment is None:
        return "Comment not found", 404
    vote = None
    if user is not None:
        vote = database.session.query(db.CommentVote).filter_by(
            comment_id=comment_id, user_id=user["id"]).first()
    if vote is None:
        return {"vote": 0, "upvotes": comment.upvotes,  "downvotes": comment.downvotes}, 200
    elif vote.is_upvote:
        return {"vote": 1, "upvotes": comment.upvotes,  "downvotes": comment.downvotes}, 200
    return {"vote": -1, "upvotes": comment.upvotes,  "downvotes": comment.downvotes}, 200


@app.route("/cm/<int:comment_id>/info", methods=["GET"])
def get_comment_info(comment_id):
    comment = database.session.query(db.Comment).get(comment_id)
    if comment is None:
        return "Comment not found", 404
    comment_schema = schema.CommentSchema()
    return jsonify(comment_schema.dump(comment)), 200


# ----------------------------
# ME
# ----------------------------


@app.route("/me/info", methods=["GET"])
@authorize
def get_me(user=None):
    u = database.session.query(db.User).filter_by(id=user["id"]).first()
    user_schema = schema.UserSchema()
    return jsonify(user_schema.dump(u)), 200


@app.route("/me/update", methods=["POST"])
@authorize
def update_me(user=None):
    b = request.get_json()
    try:
        schema.update_me_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    user = database.session.query(db.User).get(user["id"])
    if "username" in b and b["username"]:
        b["username"] = b["username"].strip()
        if len(b["username"])==0:
            return {"error":"Username cannot be empty"}, 400
        user.username = b["username"]
    if "password" in b and b["password"]:
        user.password = hashpw(b["password"].encode("utf-8"), gensalt())
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/me/communities", methods=["GET"])
@authorize
def get_me_communities(user=None):
    joined = database.session.query(db.Community).join(db.SubscribedCommunity).filter(
        db.SubscribedCommunity.user_id == user["id"]).all()
    communities_schema = schema.CommunitySchema(many=True)
    return jsonify(communities_schema.dump(joined)), 200


@app.route("/me/feed", methods=["GET"])
@authorize
def get_me_feed(user=None):
    joined = database.session.query(db.Community).join(db.SubscribedCommunity).filter(
        db.SubscribedCommunity.user_id == user["id"]).all()
    posts = database.session.query(db.Post).filter(
        db.Post.community_id.in_([c.id for c in joined])).order_by(db.Post.id.desc()).limit(20).all()
    posts_schema = schema.PostSchema(many=True)
    return jsonify(posts_schema.dump(posts)), 200


@app.route("/me/pic", methods=["POST"])
@authorize
@upload_file
def upload_dp(user=None, filename=None):
    u = database.session.query(db.User).filter_by(id=user["id"]).first()
    u.display_pic = f"/static/{filename}"
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/me/password", methods=["POST"])
@authorize
def change_password(user=None):
    b = request.get_json()
    try:
        schema.password_change_schema.load(b)
    except ValidationError as err:
        return err.messages, 400
    u = database.session.query(db.User).filter_by(id=user["id"]).first()
    if not checkpw(b["old_password"].encode("utf-8"), u.password.encode("utf-8")):
        return {"error": "Incorrect password"}, 400
    u.password = hashpw(b["new_password"].encode("utf-8"), gensalt())
    database.session.commit()
    return '{"status": "OK"}', 200


@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("q")
    if not query:
        return {"error": "bad search"}, 400
    query = f"%{query}%"
    users = database.session.query(db.User).filter(
        db.User.username.like(query)).all()
    communities = database.session.query(db.Community).filter(
        db.Community.name.like(query)).all()
    user_schema = schema.UserSchema(many=True)
    community_schema = schema.CommunitySchema(many=True)
    return jsonify({
        "users": user_schema.dump(users),
        "communities": community_schema.dump(communities),
    }), 200


@app.route("/search-posts", methods=["GET"])
def search_posts():
    query = request.args.get("q")
    if not query:
        return {"error": "bad search"}, 400
    query = f"%{query}%"
    posts = database.session.query(db.Post).filter(
        or_(db.Post.title.like(query), db.Post.content.like(query))).all()
    post_schema = schema.PostSchema(many=True)
    comments = database.session.query(db.Comment).filter(
        db.Comment.content.like(query)).all()
    comment_schema = schema.CommentSchema(many=True)
    return jsonify({
        "posts": post_schema.dump(posts),
        "comments": comment_schema.dump(comments),
    }), 200

# ----------------------------
# trending
# ----------------------------


@app.route("/trending", methods=["GET"])
def trending():
    posts = database.session.query(db.Post).order_by(
        db.Post.upvotes.desc()).limit(20).all()
    posts = sorted(posts, key=lambda x: datetime.now() -
                   x.time_created, reverse=True)
    post_schema = schema.PostSchema(many=True)
    return jsonify(post_schema.dump(posts)), 200

# ----------------------------
# STATIC
# ----------------------------


@app.route("/static/<string:path>", methods=["GET"])
def send_static(path):
    return send_from_directory("uploads", path)

def create_app() :
    database.init_app(app)
    return app



if __name__ == "__main__":
    database.init_app(app)
    with app.app_context():
        database.create_all()
    app.run(host='0.0.0.0',debug=True)

