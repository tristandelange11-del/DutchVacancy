"""Safe legacy entry point. Demo seeding is permanently disabled."""
if __name__ == "__main__":
    raise SystemExit("Demo seeding is disabled. No database was accessed. Use pytest for isolated test data.")
