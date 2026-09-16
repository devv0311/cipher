import { z } from "zod";

/**
 * Acquisition manifest for a real solved-case benchmark
 * (docs/benchmark/source-register.md). Tracked in git; the documents it lists
 * are not (owner decision B). `pack` fixes, per document and before any
 * transcription, whether the document may ever be shown to the pipeline.
 */
export const BenchmarkPackSchema = z.enum(["evidence", "ground_truth", "excluded"]);
export type BenchmarkPack = z.infer<typeof BenchmarkPackSchema>;

export const AcquisitionManifestSchema = z.object({
  caseId: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/),
  caption: z.string().min(1),
  courts: z.array(z.string().min(1)).min(1),
  docketPage: z.string().url(),
  retrievalMethod: z.string().min(1),
  register: z.string().min(1),
  localStore: z.string().min(1),
  documents: z
    .array(
      z.object({
        documentId: z.string().regex(/^SR-\d{3}$/),
        docketEntry: z.number().int().positive(),
        attachment: z.number().int().min(0),
        title: z.string().min(1),
        documentType: z.string().min(1),
        pack: BenchmarkPackSchema,
        url: z.string().url(),
        fileName: z.string().regex(/^[\w.-]+\.pdf$/),
        bytes: z.number().int().positive(),
        sha256: z.string().regex(/^[0-9a-f]{64}$/),
        retrievedAt: z.string().datetime(),
      }),
    )
    .min(1),
});
export type AcquisitionManifest = z.infer<typeof AcquisitionManifestSchema>;
