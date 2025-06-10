ALTER TABLE "dilemmas" ALTER COLUMN "dilemma_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "dilemmas" ALTER COLUMN "dilemma_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "llm_responses" ALTER COLUMN "dilemma_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_responses" ALTER COLUMN "dilemma_id" SET DATA TYPE uuid;