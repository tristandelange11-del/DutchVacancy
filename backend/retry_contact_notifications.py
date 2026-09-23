"""Run manually after resolving an email outage. Does not delete messages."""
import asyncio
import os

from lib.db import db, client
from lib.contact import notify_contact


async def main():
    if not os.getenv("CONTACT_NOTIFICATION_EMAIL") or not os.getenv("RESEND_API_KEY"):
        raise SystemExit("Configure CONTACT_NOTIFICATION_EMAIL and RESEND_API_KEY first.")
    failures = 0
    async for message in db.contact_messages.find({"notification_status": {"$in": ["pending", "failed"]}}):
        if not await notify_contact(db, message):
            failures += 1
    client.close()
    if failures:
        raise SystemExit(f"{failures} notifications remain undelivered.")


if __name__ == "__main__":
    asyncio.run(main())
