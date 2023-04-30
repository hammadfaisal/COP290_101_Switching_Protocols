from flask import g, current_app
from sqlalchemy import Column, DateTime, Integer, Boolean, Text, String, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from flask_sqlalchemy import SQLAlchemy

database = SQLAlchemy()

Base = declarative_base()


class User(database.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True,
                autoincrement=True, unique=True)
    username = Column(Text)
    email = Column(Text)
    password = Column(Text)
    display_pic = Column(Text)
    last_login = Column(DateTime, server_default=func.now())
    time_joined = Column(DateTime, server_default=func.now())
    user_status = Column(Integer)


class Vote(database.Model):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(ForeignKey(
        "posts.id", ondelete="CASCADE"), nullable=False)
    time = Column(DateTime, server_default=func.now())
    user_id = Column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    upvote = Column(Boolean)
    user = relationship("User", foreign_keys="Vote.user_id")
    post = relationship("Post", foreign_keys="Vote.post_id")


class Post(database.Model):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    display_pic = Column(Text)
    downvotes = Column(Integer, default=0)
    is_deleted = Column(Boolean)
    time_created = Column(DateTime, server_default=func.now())
    title = Column(Text)
    upvotes = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    user_id = Column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    community_id = Column(ForeignKey(
        "communities.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", foreign_keys="Post.user_id")
    community = relationship("Community", foreign_keys="Post.community_id")


class Community(database.Model):
    __tablename__ = "communities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True)
    description = Column(Text)
    display_pic = Column(Text)
    is_banned = Column(Boolean, default=0)
    is_deleted = Column(Boolean, default=0)
    time_created = Column(DateTime, server_default=func.now())
    sub_count = Column(Integer, default=1)
    admin_id = Column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    created_by_id = Column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    admin = relationship("User", foreign_keys="Community.admin_id")
    created_by = relationship("User", foreign_keys="Community.created_by_id")


class Comment(database.Model):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    downvotes = Column(Integer, default=0)
    is_deleted = Column(Boolean)
    parent_comment = Column(ForeignKey(
        "comments.id", ondelete="CASCADE"), nullable=True)
    time_created = Column(DateTime, server_default=func.now())
    upvotes = Column(Integer, default=0)
    user_id = Column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(ForeignKey(
        "posts.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", foreign_keys="Comment.user_id")
    post = relationship("Post", foreign_keys="Comment.post_id")


class SubscribedCommunity(database.Model):
    __tablename__ = "subscribed_communities"
    id = Column(Integer, primary_key=True, index=True)
    time = Column(DateTime, server_default=func.now())
    user_id = Column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    community_id = Column(ForeignKey(
        "communities.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", foreign_keys="SubscribedCommunity.user_id")
    community = relationship(
        "Community", foreign_keys="SubscribedCommunity.community_id")


class CommentVote(database.Model):
    __tablename__ = "comment_votes"
    id = Column(Integer, primary_key=True, index=True)
    time = Column(DateTime, server_default=func.now())
    is_upvote = Column(Boolean)
    user_id = Column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    comment_id = Column(ForeignKey(
        "comments.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", foreign_keys="CommentVote.user_id")
    comment = relationship("Comment", foreign_keys="CommentVote.comment_id")
