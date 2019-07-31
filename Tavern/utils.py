def test_greater_than(response, path, value):
    keys = path.split('.')
    response_value = response.json()

    for key in keys:
        response_value = response_value.get(key, None)

    try:
        assert int(response_value) > int(value)
    except ValueError:
        print("Error asserting that the response value is greater than {}".format(value))
        raise

    return int(response_value)
