local key = KEYS[1]
local value = ARGV[1]
local maxLen = tonumber(ARGV[2])
local len = redis.pcall('lpush', key, value)
if len > maxLen then
    redis.pcall('rpop',key)
end