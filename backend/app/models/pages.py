class Page():
    total_count: int
    skip: int
    limit: int

    def __init__(self, total_count: int, skip: int, limit: int):
        self.total_count = total_count
        self.skip = skip
        self.limit = limit
