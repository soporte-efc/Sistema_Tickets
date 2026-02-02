-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caller_name" TEXT,
    "call_duration" TEXT,
    "subject" TEXT,
    "ticket_type" TEXT,
    "solution" TEXT,
    "site" TEXT,
    "raw_text" TEXT,
    "status" TEXT DEFAULT 'pendiente',

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);
