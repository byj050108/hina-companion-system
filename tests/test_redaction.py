from hina_companion.redaction import redact, redact_text


def test_redacts_credentials_and_user_home():
    value = "Authorization: Bearer demo-secret /home/example/private"
    safe = redact_text(value)
    assert "demo-secret" not in safe
    assert "/home/example" not in safe
    assert "${HOME}" in safe


def test_redacts_private_payload_fields():
    safe = redact({"message_body": "private words", "nested": {"token": "secret"}})
    assert safe["message_body"] == "<redacted>"
    assert safe["nested"]["token"] == "<redacted>"
