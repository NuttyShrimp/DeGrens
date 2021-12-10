function IsWeaponBlocked(WeaponName)
    for _, name in pairs(Config.DurabilityBlockedWeapons) do
        if name == WeaponName then
            return true
        end 
    end

    return false
end

function HasAttachment(component, attachments)
    for k, attachment in pairs(attachments) do
        if attachment.component == component then
            return true, k
        end
    end

    return false
end