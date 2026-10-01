"""The vacancy list filters: several values per filter, one value as before, and a
search text that is matched literally."""

from datetime import datetime, timedelta, timezone

from tests.test_vacancy_lifecycle import env, insert_job  # noqa: F401  (env is a fixture)


def soon():
    return datetime.now(timezone.utc) + timedelta(days=10)


def titles(env, **params):
    r = env["anon"].get("/jobs", params=params)
    assert r.status_code == 200, r.text
    return sorted(j["title"] for j in r.json()["items"])


def test_several_cities_match_any_of_them(env):
    insert_job(env, title="In Utrecht", city="Utrecht", valid_through=soon())
    insert_job(env, title="In Groningen", city="Groningen", valid_through=soon())
    insert_job(env, title="In Leiden", city="Leiden", valid_through=soon())

    assert titles(env, city="Utrecht,Groningen") == ["In Groningen", "In Utrecht"]
    assert titles(env, city="Utrecht") == ["In Utrecht"]
    assert titles(env, city="Utrecht,,") == ["In Utrecht"]


def test_several_language_levels_and_filters_combine(env):
    insert_job(env, title="English only", english_level="english_only", work_mode="remote", valid_through=soon())
    insert_job(env, title="Basic Dutch", english_level="basic_dutch", work_mode="on_site", valid_through=soon())
    insert_job(env, title="Dutch needed", english_level="dutch_required", work_mode="remote", valid_through=soon())

    assert titles(env, english_level="english_only,basic_dutch") == ["Basic Dutch", "English only"]
    assert titles(env, english_level="english_only,basic_dutch", work_mode="remote") == ["English only"]


def test_search_text_is_matched_literally(env):
    insert_job(env, title="C++ developer", valid_through=soon())
    insert_job(env, title="Cook", valid_through=soon())

    assert titles(env, q="c++") == ["C++ developer"]
    assert titles(env, q="(") == []
