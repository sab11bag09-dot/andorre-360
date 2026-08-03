import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminApi,
  categoryUpdate,
  categoryDelete,
  externalVideoCreate,
  mediaFindUnique,
  mediaUpdate,
  mediaDelete,
  mediaCreate,
  uploadMedia,
} = vi.hoisted(() => ({
  requireAdminApi: vi.fn(),
  categoryUpdate: vi.fn(),
  categoryDelete: vi.fn(),
  externalVideoCreate: vi.fn(),
  mediaFindUnique: vi.fn(),
  mediaUpdate: vi.fn(),
  mediaDelete: vi.fn(),
  mediaCreate: vi.fn(),
  uploadMedia: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdminApi }));
vi.mock("@/lib/media/upload", () => ({ uploadMedia }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      update: categoryUpdate,
      delete: categoryDelete,
    },
    externalVideo: {
      create: externalVideoCreate,
    },
    media: {
      findUnique: mediaFindUnique,
      update: mediaUpdate,
      delete: mediaDelete,
      create: mediaCreate,
    },
  },
}));

import {
  DELETE as deleteCategory,
  PATCH as patchCategory,
} from "./categories/[id]/route";
import { POST as createExternalVideo } from "./external-videos/route";
import {
  DELETE as deleteMedia,
  PATCH as patchMedia,
} from "./media/[id]/route";
import { POST as uploadMediaRoute } from "./media/upload/route";
import { POST as uploadImageRoute } from "./upload/image/route";

describe("autorisation des API d’écriture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminApi.mockResolvedValue(
      Response.json(
        { error: "Authentification requise." },
        { status: 401 },
      ),
    );
  });

  it("refuse toutes les écritures avant de lire la requête ou muter", async () => {
    const request = {
      json: vi.fn(),
      formData: vi.fn(),
    } as unknown as Request;
    const context = {
      params: Promise.resolve({ id: "7" }),
    };

    const responses = await Promise.all([
      patchCategory(request, context),
      deleteCategory(request, context),
      createExternalVideo(request),
      patchMedia(request as never, context),
      deleteMedia(request, context),
      uploadMediaRoute(request),
      uploadImageRoute(request),
    ]);

    expect(responses.map((response) => response.status)).toEqual(
      Array(7).fill(401),
    );
    expect(requireAdminApi).toHaveBeenCalledTimes(7);
    expect(request.json).not.toHaveBeenCalled();
    expect(request.formData).not.toHaveBeenCalled();

    for (const mutation of [
      categoryUpdate,
      categoryDelete,
      externalVideoCreate,
      mediaFindUnique,
      mediaUpdate,
      mediaDelete,
      mediaCreate,
      uploadMedia,
    ]) {
      expect(mutation).not.toHaveBeenCalled();
    }
  });
});
