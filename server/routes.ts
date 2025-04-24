import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route('/api');

  // Users endpoints
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ status: 'success', data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', data: user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch user' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ status: 'error', message: 'Username already exists' });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      }

      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', data: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete user' });
    }
  });

  // Posts endpoints
  app.get('/api/posts', async (req: Request, res: Response) => {
    try {
      const posts = await storage.getAllPosts();
      res.json({ status: 'success', data: posts });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch posts' });
    }
  });

  app.get('/api/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
      }

      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ status: 'error', message: 'Post not found' });
      }

      res.json({ status: 'success', data: post });
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch post' });
    }
  });

  app.post('/api/posts', async (req: Request, res: Response) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      
      // Verify user exists
      if (postData.user_id) {
        const user = await storage.getUser(postData.user_id);
        if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
        }
      }

      const post = await storage.createPost(postData);
      res.status(201).json({ status: 'success', data: post });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating post:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create post' });
    }
  });

  app.put('/api/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
      }

      const postData = req.body;
      const updatedPost = await storage.updatePost(id, postData);
      
      if (!updatedPost) {
        return res.status(404).json({ status: 'error', message: 'Post not found' });
      }

      res.json({ status: 'success', data: updatedPost });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update post' });
    }
  });

  app.delete('/api/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
      }

      const deleted = await storage.deletePost(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Post not found' });
      }

      res.json({ status: 'success', message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete post' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
