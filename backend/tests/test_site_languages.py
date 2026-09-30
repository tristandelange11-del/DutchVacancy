"""Both language versions are discoverable: sitemap alternates, robots rules and email links."""

import xml.etree.ElementTree as ET

from lib.site import localized_path

NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9", "x": "http://www.w3.org/1999/xhtml"}


def test_localized_paths():
    assert localized_path("/", "nl") == "/"
    assert localized_path("/", "en") == "/en"
    assert localized_path("/jobs/abc", "en") == "/en/jobs/abc"
    assert localized_path("/jobs/abc", None) == "/jobs/abc"
    assert localized_path("/jobs/abc", "de") == "/jobs/abc"


def test_sitemap_lists_every_page_in_both_languages_with_alternates(client):
    root = ET.fromstring(client.get("/seo/sitemap.xml").content)
    entries = {u.find("s:loc", NS).text: u for u in root.findall("s:url", NS)}
    base = "https://testserver"
    for path in ("/", "/jobs", "/guide", "/employers"):
        nl, en = base + localized_path(path, "nl"), base + localized_path(path, "en")
        assert nl in entries and en in entries
        for loc in (nl, en):
            alternates = {a.get("hreflang"): a.get("href") for a in entries[loc].findall("x:link", NS)}
            assert alternates == {"nl": nl, "en": en, "x-default": nl}


def test_robots_blocks_private_pages_in_both_languages(client):
    robots = client.get("/seo/robots.txt").text
    for path in ("/login", "/en/login", "/register", "/en/register", "/student/", "/en/student/", "/employer/", "/en/employer/"):
        assert f"Disallow: {path}\n" in robots


def test_email_links_open_the_recipients_language(client):
    from routers import auth

    payload = {"name": "Test Student", "email": "en-links@example.com", "password": "Correct-Horse-1!",
               "role": "student", "lang": "en"}
    client.post("/auth/register", json=payload)
    assert "/en/verify-email?token=" in auth.send_email.await_args.args[5]
    client.cookies.clear()
    payload.update(email="nl-links@example.com", lang="nl")
    client.post("/auth/register", json=payload)
    link = auth.send_email.await_args.args[5]
    assert "/verify-email?token=" in link and "/en/" not in link
