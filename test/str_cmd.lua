local key = KEYS[1]
local value = ARGV[1]
redis.pcall('set', key, value)
