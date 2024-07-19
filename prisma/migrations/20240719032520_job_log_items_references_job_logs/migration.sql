-- AddForeignKey
ALTER TABLE "job_log_items" ADD CONSTRAINT "job_log_items_job_log_id_fkey" FOREIGN KEY ("job_log_id") REFERENCES "job_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
