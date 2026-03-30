"""
Pytest configuration and fixtures for BharatTycoon Backend Tests
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    from starlette.testclient import TestClient
    from main import app
    return TestClient(app)
