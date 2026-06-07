require("dotenv/config");

const path = require("path");
const express = require("express");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const app = express();
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Please add it to your .env file.");
}

const usesRenderPostgres = databaseUrl && databaseUrl.includes("render.com");
const adapter = new PrismaPg({
  connectionString: databaseUrl,
  ssl: usesRenderPostgres ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    });

    res.render("index", { todos });
  } catch (error) {
    next(error);
  }
});

app.post("/todos", async (req, res, next) => {
  try {
    const title = req.body.title.trim();

    if (title.length > 0) {
      await prisma.todo.create({
        data: { title },
      });
    }

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.post("/todos/:id/toggle", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.redirect("/");
    }

    const todo = await prisma.todo.findUnique({ where: { id } });

    if (todo) {
      await prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed },
      });
    }

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.post("/todos/:id/delete", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isInteger(id)) {
      await prisma.todo.deleteMany({
        where: { id },
      });
    }

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("Internal server error");
});

app.listen(port, () => {
  console.log(`Todo app is running on port ${port}`);
});
