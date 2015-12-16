local keys = redis.pcall('keys', 'key*')
for _,key in pairs(keys) do
    local t = redis.pcall('type',key)
    local stype = ''
    if type(t) == 'table' then
        for _, v in pairs(t) do
            stype = stype .. v
        end
    else
        stype = t
    end
    if stype == 'list' then
        local len = redis.pcall('llen',key)
        local beyond = len - 100
        if beyond > 0 then
            for i = 1, beyond do
                redis.pcall('rpop',key)
            end
        end
    end
end