"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientBlogRouter = void 0;
const express_1 = require("express");
const client_blog_controller_1 = require("./client-blog-controller");
const router = (0, express_1.Router)();
exports.ClientBlogRouter = router;
router.get('/guest/blogs', client_blog_controller_1.getAllBlogsController);
router.get('/guest/blogs/:id', client_blog_controller_1.getBlogByIdController);
