from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import Schema, ValidationError, fields

import db

# ----------------------------
# RETURN SCHEMA
# ----------------------------


class PostSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = db.Post
        load_instance = True
        include_relationships = True


class PostVoteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = db.Vote
        load_instance = True
        include_relationships = True


class CommunitySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = db.Community
        load_instance = True
        include_relationships = True


class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = db.User
        load_instance = True
        include_relationships = True
        exclude = ("password",)


class CommentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = db.Comment
        load_instance = True
        include_relationships = True

    # replies
    replies = fields.Nested("CommentSchema", many=True)


class CommentVoteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = db.CommentVote
        load_instance = True
        include_relationships = True

# ----------------------------
# INPUT SCHEMA
# ----------------------------

class RegisterSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)
    display_pic = fields.Str(required=False)

class LoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)


class CreateCommentSchema(Schema):
    content = fields.Str(required=True)
    parent = fields.Int(required=False)
    post = fields.Int(required=True)


class CreatePostSchema(Schema):
    title = fields.Str(required=True)
    content = fields.Str(required=True)
    community_id = fields.Int(required=True)
    display_pic = fields.Str(required=False)


class CreateCommunitySchema(Schema):
    name = fields.Str(required=True)
    description = fields.Str(required=True)
    display_pic = fields.Str(required=False)


class UpdateCommunitySchema(Schema):
    id = fields.Int(required=True)
    name = fields.Str(required=False)
    description = fields.Str(required=False)
    display_pic = fields.Str(required=False)


class UpdatePostSchema(Schema):
    id = fields.Int(required=True)
    title = fields.Str(required=False)
    content = fields.Str(required=False)
    display_pic = fields.Str(required=False)


class UpdateCommentSchema(Schema):
    id = fields.Int(required=True)
    content = fields.Str(required=False)


class UpdateMeSchema(Schema):
    username = fields.Str(required=False)
    password = fields.Str(required=False)
    email = fields.Str(required=False)
    display_pic = fields.Str(required=False)
    bio = fields.Str(required=False)

class JoinCommunitySchema(Schema):
    id = fields.Int(required=True)

class PasswordChangeSchema(Schema):
    old_password = fields.Str(required=True)
    new_password = fields.Str(required=True)

login_schema = LoginSchema()
register_schema = RegisterSchema()
create_comment_schema = CreateCommentSchema()
create_post_schema = CreatePostSchema()
create_community_schema = CreateCommunitySchema()
update_community_schema = UpdateCommunitySchema()
update_post_schema = UpdatePostSchema()
update_comment_schema = UpdateCommentSchema()
join_community_schema = JoinCommunitySchema()
password_change_schema = PasswordChangeSchema()
update_me_schema = UpdateMeSchema()
