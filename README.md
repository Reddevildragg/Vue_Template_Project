# Python Boilerplate

A modern Python project boilerplate featuring strict static typing, fast linting and formatting, and unit testing.

## Tech Stack

- **Python Version**: >= 3.9
- **Type Checking**: `mypy` for strict static type checking (similar to TypeScript).
- **Linting & Formatting**: `ruff` for extremely fast linting and auto-formatting (replaces Flake8/Black/isort/etc.).
- **Testing**: `pytest` for unit testing.

## Project Structure

- `src/`: Main application source code.
- `tests/`: Unit tests.

## Setup

First, it is recommended to create a virtual environment:

```sh
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Then, install the development dependencies:

```sh
pip install -r requirements-dev.txt
```

## Running Tools

### Static Type Checking (Mypy)

Run Mypy to check for type errors:

```sh
mypy src tests
```

### Linting and Formatting (Ruff)

Check for linting errors and formatting issues:

```sh
ruff check src tests
```

To automatically fix linting errors and format code:

```sh
ruff check --fix src tests
ruff format src tests
```

### Testing (Pytest)

Run all unit tests:

```sh
pytest
```
