def add(a: int, b: int) -> int:
    """Adds two integers together.

    Args:
        a: The first integer.
        b: The second integer.

    Returns:
        The sum of a and b.
    """
    return a + b


def main() -> None:
    """Main entry point for the sample module."""
    result = add(2, 3)
    print(f"2 + 3 = {result}")


if __name__ == "__main__":
    main()
