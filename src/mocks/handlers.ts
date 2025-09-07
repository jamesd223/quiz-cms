import { http, HttpResponse, delay } from "msw";
import { v4 as uuid } from "uuid";
import { type Quiz } from "@/types/quiz";

type DB = {
  quizzes: Quiz[];
  media: { id: string; url: string; name: string }[];
  users: { id: string; email: string; password: string }[];
};

const makeNow = () => new Date().toISOString();

const db: DB = {
  quizzes: [],
  media: [
    {
      id: uuid(),
      url: "https://placehold.co/600x400/png",
      name: "Placeholder",
    },
  ],
  users: [{ id: uuid(), email: "admin@example.com", password: "password" }],
};

// Seed a sample quiz
(() => {
  const quizId = uuid();
  db.quizzes.push({
    id: quizId,
    title: "Wellness Intake",
    slug: "wellness-intake",
    brand: "Acme Health",
    status: "draft",
    updatedAt: makeNow(),
    versions: [
      {
        id: uuid(),
        name: "v1",
        isDefault: true,
        trafficWeight: 100,
        steps: [
          {
            id: uuid(),
            orderIndex: 0,
            meta: {
              title: "Basics",
              description: "Tell us about you",
              footnote: "We respect your privacy",
              cta: "Continue",
              isVisible: true,
              layout: "default",
              media: null,
            },
            gridColumns: 12,
            gridGapPx: 8,
            fields: [],
          },
        ],
      },
    ],
  });
})();

export const handlers = [
  // Auth
  http.post("/api/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const user = db.users.find(
      (u) => u.email === body.email && u.password === body.password
    );
    await delay(300);
    if (!user)
      return HttpResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    return HttpResponse.json({
      token: `mock-${uuid()}`,
      user: { id: user.id, email: user.email },
    });
  }),

  // Quizzes list
  http.get("/api/quizzes", async ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const filtered = db.quizzes
      .filter((qz) =>
        [qz.title, qz.slug, qz.brand].some((v) => v.toLowerCase().includes(q))
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    await delay(200);
    return HttpResponse.json({ items: filtered });
  }),

  http.post("/api/quizzes", async ({ request }) => {
    const body = (await request.json()) as {
      title: string;
      slug: string;
      brand: string;
    };
    const quiz: Quiz = {
      id: uuid(),
      title: body.title,
      slug: body.slug,
      brand: body.brand,
      status: "draft",
      updatedAt: makeNow(),
      versions: [],
    };
    db.quizzes.unshift(quiz);
    await delay(200);
    return HttpResponse.json(quiz, { status: 201 });
  }),

  http.patch("/api/quizzes/:id/archive", async ({ params }) => {
    const { id } = params as { id: string };
    const quiz = db.quizzes.find((q) => q.id === id);
    if (!quiz)
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    quiz.status = "archived";
    quiz.updatedAt = makeNow();
    await delay(200);
    return HttpResponse.json(quiz);
  }),

  // Quiz detail
  http.get("/api/quizzes/:id", async ({ params }) => {
    const { id } = params as { id: string };
    const quiz = db.quizzes.find((q) => q.id === id);
    await delay(150);
    if (!quiz)
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    return HttpResponse.json(quiz);
  }),

  // Versions
  http.post("/api/quizzes/:id/versions", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as { name: string };
    const quiz = db.quizzes.find((q) => q.id === id);
    if (!quiz)
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    const version = {
      id: uuid(),
      name: body.name,
      isDefault: quiz.versions.length === 0,
      trafficWeight: 0,
      steps: [],
    } as Quiz["versions"][number];
    quiz.versions.push(version);
    quiz.updatedAt = makeNow();
    await delay(150);
    return HttpResponse.json(version, { status: 201 });
  }),

  http.patch(
    "/api/quizzes/:id/versions/:versionId",
    async ({ params, request }) => {
      const { id, versionId } = params as { id: string; versionId: string };
      const updates = (await request.json()) as Partial<{
        name: string;
        isDefault: boolean;
        trafficWeight: number;
      }>;
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      if (typeof updates.name === "string") v.name = updates.name;
      if (typeof updates.trafficWeight === "number")
        v.trafficWeight = updates.trafficWeight;
      if (typeof updates.isDefault === "boolean") {
        for (const other of quiz.versions) other.isDefault = false;
        v.isDefault = true;
      }
      quiz.updatedAt = makeNow();
      await delay(120);
      return HttpResponse.json(v);
    }
  ),

  // Steps
  http.post(
    "/api/quizzes/:id/versions/:versionId/steps",
    async ({ params, request }) => {
      const { id, versionId } = params as { id: string; versionId: string };
      const body = (await request.json()) as {
        title: string;
      };
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const step = {
        id: uuid(),
        orderIndex: v.steps.length,
        meta: {
          title: body.title,
          description: "",
          footnote: "",
          cta: "Continue",
          isVisible: true,
          layout: "default" as const,
          media: null,
        },
        gridColumns: 12,
        gridGapPx: 8,
        fields: [],
      };
      v.steps.push(step);
      quiz.updatedAt = makeNow();
      await delay(120);
      return HttpResponse.json(step, { status: 201 });
    }
  ),

  http.patch(
    "/api/quizzes/:id/versions/:versionId/steps/:stepId",
    async ({ params, request }) => {
      const { id, versionId, stepId } = params as {
        id: string;
        versionId: string;
        stepId: string;
      };
      const updates = (await request.json()) as Partial<{
        meta: Partial<{
          title: string;
          description?: string;
          footnote?: string;
          cta?: string;
          isVisible: boolean;
          layout: "default" | "wide" | "narrow";
        }>;
        gridColumns: number;
        gridGapPx: number;
      }>;
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const step = v.steps.find((s) => s.id === stepId);
      if (!step)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      if (typeof updates.gridColumns === "number")
        step.gridColumns = updates.gridColumns;
      if (typeof updates.gridGapPx === "number")
        step.gridGapPx = updates.gridGapPx;
      if (updates.meta) {
        step.meta = { ...step.meta, ...updates.meta } as any;
      }
      quiz.updatedAt = makeNow();
      await delay(80);
      return HttpResponse.json(step);
    }
  ),

  http.patch(
    "/api/quizzes/:id/versions/:versionId/steps/reorder",
    async ({ params, request }) => {
      const { id, versionId } = params as { id: string; versionId: string };
      const body = (await request.json()) as { order: string[] };
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const map = new Map(v.steps.map((s) => [s.id, s] as const));
      v.steps = body.order.map((id, idx) => ({
        ...map.get(id)!,
        orderIndex: idx,
      }));
      quiz.updatedAt = makeNow();
      await delay(100);
      return HttpResponse.json(v.steps);
    }
  ),

  http.delete(
    "/api/quizzes/:id/versions/:versionId/steps/:stepId",
    async ({ params }) => {
      const { id, versionId, stepId } = params as {
        id: string;
        versionId: string;
        stepId: string;
      };
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      v.steps = v.steps
        .filter((s) => s.id !== stepId)
        .map((s, i) => ({ ...s, orderIndex: i }));
      quiz.updatedAt = makeNow();
      await delay(100);
      return HttpResponse.json({ ok: true });
    }
  ),

  // Fields
  http.post(
    "/api/quizzes/:id/versions/:versionId/steps/:stepId/fields",
    async ({ params, request }) => {
      const { id, versionId, stepId } = params as {
        id: string;
        versionId: string;
        stepId: string;
      };
      const body = (await request.json()) as {
        type:
          | "input_text"
          | "input_number"
          | "input_email"
          | "input_phone"
          | "input_date"
          | "input_slider"
          | "choice_single"
          | "choice_multi"
          | "group";
        label?: string;
      };
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const step = v.steps.find((s) => s.id === stepId);
      if (!step)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });

      const gridCols = step.gridColumns;
      const occupied = new Set<string>();
      for (const f of step.fields) {
        const rs = f.position.row;
        const cs = f.position.col;
        const re = rs + f.position.rowSpan - 1;
        const ce = Math.min(gridCols, cs + f.position.colSpan - 1);
        for (let r = rs; r <= re; r++) {
          for (let c = cs; c <= ce; c++) occupied.add(`${r}:${c}`);
        }
      }
      // Find first free cell scanning rows 1..200
      let foundRow = 1;
      let foundCol = 1;
      outer: for (let r = 1; r < 200; r++) {
        for (let c = 1; c <= gridCols; c++) {
          const key = `${r}:${c}`;
          if (!occupied.has(key)) {
            foundRow = r;
            foundCol = c;
            break outer;
          }
        }
      }

      const fieldBase = {
        id: uuid(),
        type: body.type as any,
        key: `field_${Math.random().toString(36).slice(2, 8)}`,
        label: body.label ?? "New field",
        help: "",
        required: false,
        placeholder: "",
        min: undefined,
        max: undefined,
        unit: undefined,
        validation: undefined,
        position: { row: foundRow, col: foundCol, rowSpan: 1, colSpan: 1 },
      } as any;

      let newField: any = fieldBase;
      if (body.type === "choice_single" || body.type === "choice_multi") {
        newField = { ...fieldBase, options: [] };
      }
      if (body.type === "group") {
        newField = {
          ...fieldBase,
          containerLayoutMode: "auto",
          groupedInputs: [],
        };
      }

      step.fields.push(newField);
      quiz.updatedAt = makeNow();
      await delay(100);
      return HttpResponse.json(newField, { status: 201 });
    }
  ),

  http.patch(
    "/api/quizzes/:id/versions/:versionId/steps/:stepId/fields/:fieldId",
    async ({ params, request }) => {
      const { id, versionId, stepId, fieldId } = params as {
        id: string;
        versionId: string;
        stepId: string;
        fieldId: string;
      };
      const updates = (await request.json()) as any;
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const step = v.steps.find((s) => s.id === stepId);
      if (!step)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const field = step.fields.find((f) => f.id === fieldId);
      if (!field)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });

      Object.assign(field, updates);
      quiz.updatedAt = makeNow();
      await delay(80);
      return HttpResponse.json(field);
    }
  ),

  http.delete(
    "/api/quizzes/:id/versions/:versionId/steps/:stepId/fields/:fieldId",
    async ({ params }) => {
      const { id, versionId, stepId, fieldId } = params as {
        id: string;
        versionId: string;
        stepId: string;
        fieldId: string;
      };
      const quiz = db.quizzes.find((q) => q.id === id);
      if (!quiz)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const v = quiz.versions.find((vv) => vv.id === versionId);
      if (!v) return HttpResponse.json({ error: "Not found" }, { status: 404 });
      const step = v.steps.find((s) => s.id === stepId);
      if (!step)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      step.fields = step.fields.filter((f) => f.id !== fieldId);
      quiz.updatedAt = makeNow();
      await delay(60);
      return HttpResponse.json({ ok: true });
    }
  ),

  // Media
  http.get("/api/media", async () => {
    await delay(100);
    return HttpResponse.json({ items: db.media });
  }),

  http.post("/api/media/upload", async ({ request }) => {
    const body = (await request.json()) as { name: string; dataUrl: string };
    const item = { id: uuid(), url: body.dataUrl, name: body.name };
    db.media.unshift(item);
    await delay(120);
    return HttpResponse.json(item, { status: 201 });
  }),
];
