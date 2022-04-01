class InvalidEngineError(Exception):
    def __init__(self, message):
        super().__init__(f"invalid engine: ${message}")
