import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

if (!process.env.DATABASE_URL) {
  console.error(
    "❌ ERROR: DATABASE_URL is not defined in environment variables!",
  );
}

describe("TaskManager API Integration Tests", () => {
  let userToken;
  let userId;
  let projectId;
  let taskId;

  const uniqueId = Date.now();
  const testUser = {
    name: "Test Developer",
    email: `test_${uniqueId}@example.com`,
    password: "Password123!",
  };

  afterAll(async () => {
    try {
      if (userId) {
        await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  // ----------------------------------------------------
  // 1. Authentication Tests
  // ----------------------------------------------------
  describe("Auth Endpoints", () => {
    test("1. POST /api/auth/register - Should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toEqual(201);
      const userData = res.body.result?.user || res.body.user;
      expect(userData.email).toEqual(testUser.email);
    });

    test("2. POST /api/auth/login - Should login and return JWT token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toEqual(200);

      const responseData = res.body.result || res.body;
      expect(responseData).toHaveProperty("token");

      userToken = responseData.token;
      userId = responseData.user.id;
    });

    test("3. POST /api/auth/register - Should fail duplicate registration with 409 (AppError)", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toMatch(/already registered|exists/i);
    });
  });

  // ----------------------------------------------------
  // 2. Project Endpoints
  // ----------------------------------------------------
  describe("Project Endpoints", () => {
    test("4. POST /api/projects - Should create a project for authenticated user", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Test Project",
          description: "Project for integration testing",
        });

      expect(res.statusCode).toEqual(201);

      const projectData =
        res.body.createProject ||
        res.body.result?.project ||
        res.body.project ||
        res.body.data ||
        res.body;

      expect(projectData).toHaveProperty("id");
      expect(projectData.name).toEqual("Test Project");
      projectId = projectData.id;
    });

    test("5. GET /api/projects/:id - Should fail with 404 for non-existent project", async () => {
      const res = await request(app)
        .get("/api/projects/non_existent_id_123")
        .set("Authorization", `Bearer ${userToken}`);

      expect([404, 400]).toContain(res.statusCode);
    });
  });

  // ----------------------------------------------------
  // 3. Task Endpoints
  // ----------------------------------------------------
  describe("Task Endpoints", () => {
    test("6. POST /api/projects/:projectId/tasks - Should create a task in the project", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Setup Unit Tests",
          description: "Write 5+ tests using Jest and Supertest",
          priority: "HIGH",
          dueDate: "2026-12-31T23:59:59.000Z",
        });

      expect(res.statusCode).toEqual(201);

      const taskData =
        res.body.createTask ||
        res.body.task ||
        res.body.result?.task ||
        res.body.data ||
        res.body;

      expect(taskData).toHaveProperty("id");
      expect(taskData.title).toEqual("Setup Unit Tests");
      taskId = taskData.id;
    });

    test("7. GET /api/projects/:projectId/tasks - Should list tasks with query filter", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?priority=HIGH`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);

      const tasksList =
        res.body.tasks || res.body.result?.tasks || res.body.data || res.body;

      expect(Array.isArray(tasksList)).toBe(true);
      expect(tasksList.length).toBeGreaterThan(0);
    });

    test("8. DELETE /api/projects/:projectId/tasks/:taskId - Should delete the created task", async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toMatch(/deleted|success/i);
    });
  });
});
