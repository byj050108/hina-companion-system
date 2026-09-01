from hina_companion.config import Settings


def test_api_bind_defaults_to_localhost(monkeypatch):
    monkeypatch.delenv("HINA_API_HOST", raising=False)
    monkeypatch.delenv("HINA_API_PORT", raising=False)

    settings = Settings.from_env()

    assert settings.api_host == "127.0.0.1"
    assert settings.api_port == 8787


def test_api_bind_can_be_overridden_for_container(monkeypatch):
    monkeypatch.setenv("HINA_API_HOST", "0.0.0.0")
    monkeypatch.setenv("HINA_API_PORT", "9876")

    settings = Settings.from_env()

    assert settings.api_host == "0.0.0.0"
    assert settings.api_port == 9876
