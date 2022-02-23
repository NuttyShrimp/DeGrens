function DespawnInterior(objects, cb)
    Citizen.CreateThread(function()
        for k, v in pairs(objects) do
            if DoesEntityExist(v) then
                DeleteEntity(v)
            end
        end

        cb()
    end)
end

function CreateRobberyHouse(tier, spawn)
	local objects = {}

    DoScreenFadeOut(500)
    while not IsScreenFadedOut() do
        Citizen.Wait(10)
    end

    RequestModel(Config.Interiors[tier].shell)
    while not HasModelLoaded(Config.Interiors[tier].shell) do
        Citizen.Wait(1000)
    end

    if tier == "small" then
        objects[#objects+1] = CreateObject(`playerhouse_hotel`, spawn.x - 0.7, spawn.y - 0.4, spawn.z - 1.42, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`v_49_motelmp_stuff`, spawn.x, spawn.y, spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_49_motelmp_bed`, spawn.x + 1.4, spawn.y - 0.55,spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_49_motelmp_clothes`, spawn.x - 2.0, spawn.y + 2.0, spawn.z + 0.15, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_49_motelmp_winframe`, spawn.x + 0.74, spawn.y - 4.26, spawn.z + 1.11, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`v_49_motelmp_glass`, spawn.x + 0.74, spawn.y - 4.26, spawn.z + 1.13, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_49_motelmp_curtains`, spawn.x + 0.74, spawn.y - 4.15, spawn.z + 0.9, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fa_trainer02r`, spawn.x - 1.9, spawn.y + 3.0, spawn.z + 0.38, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fa_trainer02l`, spawn.x - 2.1, spawn.y + 2.95, spawn.z + 0.38, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`prop_sink_06`, spawn.x + 1.1, spawn.y + 4.0,spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`prop_chair_04a`, spawn.x + 2.1, spawn.y - 2.4,spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)	
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)

        objects[#objects+1] = CreateObject(`prop_chair_04a`, spawn.x + 0.7, spawn.y - 3.5,spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`prop_kettle`, spawn.x - 2.3, spawn.y + 0.6, spawn.z + 0.9, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`Prop_TV_Cabinet_03`, spawn.x - 2.3, spawn.y - 0.6,spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)	 
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`Prop_LD_Toilet_01`, spawn.x + 2.1, spawn.y + 2.9,spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)

        objects[#objects+1] = CreateObject(`Prop_Game_Clock_02`, spawn.x - 2.55, spawn.y - 0.6, spawn.z + 2.0, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_j_phone`, spawn.x + 2.4, spawn.y - 1.9, spawn.z + 0.64, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 220)

        objects[#objects+1] = CreateObject(`v_ret_fh_ironbrd`, spawn.x - 1.7, spawn.y + 3.5, spawn.z + 0.15, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`prop_iron_01`, spawn.x - 1.9, spawn.y + 2.85, spawn.z + 0.63, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 230)

        objects[#objects+1] = CreateObject(`V_Ret_TA_Mug`, spawn.x - 2.3, spawn.y + 0.95, spawn.z + 0.9, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 20)

        objects[#objects+1] = CreateObject(`V_Ret_TA_Mug`, spawn.x - 2.2, spawn.y + 0.9, spawn.z + 0.9, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 230)

        objects[#objects+1] = CreateObject(`v_res_binder`, spawn.x - 2.2, spawn.y + 1.3, spawn.z + 0.87, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        if not Config.Houses[insideHouse].data.takeableSpawned then
            local tv = CreateObject(`prop_tv_06`, spawn.x - 2.3, spawn.y - 0.6, spawn.z + 0.7, true, false, false)
            FreezeEntityPosition(tv, true)	
            SetEntityHeading(tv, GetEntityHeading(tv) + 90)
            TriggerServerEvent('dg-houserobbery:server:TakeableSpawned', insideHouse)
        end
    elseif tier == "medium" then
        objects[#objects+1] = CreateObject(`playerhouse_tier1_full`, spawn.x, spawn.y, spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
    
        objects[#objects+1] = CreateObject(`V_16_DT`, spawn.x - 1.21854400, spawn.y - 1.04389600, spawn.z + 1.39068600, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mpmidapart01`, spawn.x + 0.52447510, spawn.y - 5.04953700, spawn.z + 1.32, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mpmidapart09`, spawn.x + 0.82202150, spawn.y + 2.29612000, spawn.z + 1.88, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mpmidapart07`, spawn.x - 1.91445900, spawn.y - 6.61911300, spawn.z + 1.45, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mpmidapart03`, spawn.x - 4.82565300, spawn.y - 6.86803900, spawn.z + 1.14, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_midapartdeta`, spawn.x + 2.28558400, spawn.y - 1.94082100, spawn.z + 1.288628, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_treeglow`, spawn.x - 1.37408500, spawn.y - 0.95420070, spawn.z + 1.135, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_midapt_curts`, spawn.x - 1.96423300, spawn.y - 0.95958710, spawn.z + 1.280, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mpmidapart13`, spawn.x - 4.65580700, spawn.y - 6.61684000, spawn.z + 1.259, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_midapt_cabinet`, spawn.x - 1.16177400, spawn.y - 0.97333810, spawn.z + 1.27, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_midapt_deca`, spawn.x + 2.311386000, spawn.y - 2.05385900, spawn.z + 1.297, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mid_hall_mesh_delta`, spawn.x + 3.69693000, spawn.y - 5.80020100, spawn.z + 1.293, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mid_bed_delta`, spawn.x + 7.95187400, spawn.y + 1.04246500, spawn.z + 1.28402300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mid_bed_bed`, spawn.x + 6.86376900, spawn.y + 1.20651200, spawn.z + 1.36589100, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_MID_bed_over_decal`, spawn.x + 7.82861300, spawn.y + 1.04696700, spawn.z + 1.34753700, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mid_bath_mesh_delta`, spawn.x + 4.45460500, spawn.y + 3.21322800, spawn.z + 1.21116100, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`V_16_mid_bath_mesh_mirror`, spawn.x + 3.57740800, spawn.y + 3.25032000, spawn.z + 1.48871300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`Prop_CS_Beer_Bot_01`, spawn.x + 1.73134600, spawn.y - 4.88520200, spawn.z + 1.91083000, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)
        
        objects[#objects+1] = CreateObject(`v_res_mp_sofa`, spawn.x - 1.48765600, spawn.y + 1.68100600, spawn.z + 1.21640500, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) - 90)
        
        objects[#objects+1] = CreateObject(`v_res_mp_stripchair`, spawn.x - 4.44770800, spawn.y - 1.78048800, spawn.z + 1.21640500, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 128.3629)

        objects[#objects+1] = CreateObject(`v_res_tre_chair`, spawn.x + 2.91325400, spawn.y - 5.27835100, spawn.z + 1.22746400, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 109.8867)

        objects[#objects+1] = CreateObject(`Prop_Plant_Int_04a`, spawn.x + 2.78941300, spawn.y - 4.39133900, spawn.z + 2.12746400, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_d_lampa`, spawn.x - 3.61473100, spawn.y - 6.61465100, spawn.z + 2.08382800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fridgemodsml`, spawn.x + 1.90339700, spawn.y - 3.80026800, spawn.z + 1.29917900, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 269.8867)

        objects[#objects+1] = CreateObject(`prop_micro_01`, spawn.x + 2.03442400, spawn.y - 4.61585100, spawn.z + 2.30395600, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) - 80)

        objects[#objects+1] = CreateObject(`V_Res_Tre_SideBoard`, spawn.x + 2.84053000, spawn.y - 4.30947100, spawn.z + 1.24577300 , false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`V_Res_Tre_BedSideTable`, spawn.x - 3.50363200, spawn.y - 6.55289400, spawn.z + 1.30625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`v_res_d_lampa`, spawn.x + 2.69674700, spawn.y - 3.83123500, spawn.z + 2.09373700, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_tree`, spawn.x - 4.96064800, spawn.y - 6.09898500, spawn.z + 1.31631400, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_Res_M_DineTble_replace`, spawn.x - 3.50712600, spawn.y - 4.13621600, spawn.z + 1.29625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`v_res_tre_plant`, spawn.x - 5.14112800, spawn.y - 2.78951000, spawn.z + 1.25950800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_m_dinechair`, spawn.x - 3.04652400, spawn.y - 4.95971200, spawn.z + 1.19625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 200)

        objects[#objects+1] = CreateObject(`v_res_m_lampstand`, spawn.x + 1.26588400, spawn.y + 3.68883900, spawn.z + 1.30556700, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_Res_M_Stool_REPLACED`, spawn.x - 3.23216300, spawn.y + 2.06159000, spawn.z + 1.20556700, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_m_dinechair`, spawn.x - 2.82237200, spawn.y - 3.59831300, spawn.z + 1.25950800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 300)

        objects[#objects+1] = CreateObject(`v_res_m_dinechair`, spawn.x - 4.14955100, spawn.y - 4.71316600, spawn.z + 1.19625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 135)

        objects[#objects+1] = CreateObject(`v_res_m_dinechair`, spawn.x - 3.80622900, spawn.y - 3.37648300, spawn.z + 1.19625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 10)

        objects[#objects+1] = CreateObject(`v_res_fa_plant01`, spawn.x + 2.97859200, spawn.y + 2.55307400, spawn.z + 1.85796300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_storageunit`, spawn.x + 8.47819500, spawn.y - 2.50979300, spawn.z + 1.19712300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`v_res_tre_storagebox`, spawn.x + 9.75982700, spawn.y - 1.35874100, spawn.z + 1.29625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) - 90)

        objects[#objects+1] = CreateObject(`v_res_tre_basketmess`, spawn.x + 8.70730600, spawn.y - 2.55503600, spawn.z + 1.94059590, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_m_lampstand`, spawn.x + 9.54306000, spawn.y - 2.50427700, spawn.z + 1.30556700, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`Prop_Plant_Int_03a`, spawn.x + 9.87521400, spawn.y + 3.90917400, spawn.z + 1.20829700, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_washbasket`, spawn.x + 9.39091500, spawn.y + 4.49676300, spawn.z + 1.19625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_Res_Tre_Wardrobe`, spawn.x + 8.46626300, spawn.y + 4.53223600, spawn.z + 1.19425800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_flatbasket`, spawn.x + 8.51593000, spawn.y + 4.55647300, spawn.z + 3.46737300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_basketmess`, spawn.x + 7.57797200, spawn.y + 4.55198800, spawn.z + 3.46737300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_flatbasket`, spawn.x + 7.12286400, spawn.y + 4.54689200, spawn.z + 3.46737300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_Res_Tre_Wardrobe`, spawn.x + 7.24382000, spawn.y + 4.53423500, spawn.z + 1.19625800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_flatbasket`, spawn.x + 8.03364600, spawn.y + 4.54835500, spawn.z + 3.46737300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_serv_switch_2`, spawn.x + 6.28086900, spawn.y - 0.68169880, spawn.z + 2.30326000, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_Res_Tre_BedSideTable`, spawn.x + 5.84416200, spawn.y + 2.57377400, spawn.z + 1.22089100, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_d_lampa`, spawn.x + 5.84912100, spawn.y + 2.58001100, spawn.z + 1.95311890, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_mlaundry`, spawn.x + 5.77729800, spawn.y + 4.60211400, spawn.z + 1.19674400, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`Prop_ashtray_01`, spawn.x - 1.24716200, spawn.y + 1.07820500, spawn.z + 1.89089300, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fa_candle03`, spawn.x - 2.89289900, spawn.y - 4.35329700, spawn.z + 2.02881310, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fa_candle02`, spawn.x - 3.99865700, spawn.y - 4.06048500, spawn.z + 2.02530190, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fa_candle01`, spawn.x - 3.37733400, spawn.y - 3.66639800, spawn.z + 2.02526200, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_m_woodbowl`, spawn.x - 3.50787400, spawn.y - 4.11983000, spawn.z + 2.02589900, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_Res_TabloidsA`, spawn.x - 0.80513000, spawn.y + 0.51389600, spawn.z + 1.18418800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`Prop_Tapeplayer_01`, spawn.x - 1.26010100, spawn.y - 3.62966400, spawn.z + 2.37883200, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_tre_fruitbowl`, spawn.x + 2.77764900, spawn.y - 4.138297000, spawn.z + 2.10340100, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_sculpt_dec`, spawn.x + 3.03932200, spawn.y + 1.62726400, spawn.z + 3.58363900, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_jewelbox`, spawn.x + 3.04164100, spawn.y + 0.31671810, spawn.z + 3.58363900, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_basketmess`, spawn.x - 1.64906300, spawn.y + 1.62675900, spawn.z + 1.39038500, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_flatbasket`, spawn.x - 1.63938900, spawn.y + 0.91133310, spawn.z + 1.39038500, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_flatbasket`, spawn.x - 1.19923400, spawn.y + 1.69598600, spawn.z + 1.39038500, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_basketmess`, spawn.x - 1.18293800, spawn.y + 0.91436380, spawn.z + 1.39038500, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_r_sugarbowl`, spawn.x - 0.26029210, spawn.y - 6.66716800, spawn.z + 3.77324900, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`Prop_Breadbin_01`, spawn.x + 2.09788500, spawn.y - 6.57634000, spawn.z + 2.24041900, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_mknifeblock`, spawn.x + 1.82084700, spawn.y - 6.58438500, spawn.z + 2.27399500, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`prop_toaster_01`, spawn.x - 1.05790700, spawn.y - 6.59017400, spawn.z + 2.26793200, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`prop_wok`, spawn.x + 2.01728800, spawn.y - 5.57091500, spawn.z + 2.26793200, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`Prop_Plant_Int_03a`, spawn.x + 2.55015600, spawn.y + 4.60183900, spawn.z + 1.20829700, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`p_tumbler_cs2_s`, spawn.x - 0.90916440, spawn.y - 4.24099100, spawn.z + 2.26793200, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`p_whiskey_bottle_s`, spawn.x - 0.92809300, spawn.y - 3.99099100, spawn.z + 2.26793200, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tissues`, spawn.x + 7.95889300, spawn.y - 2.54847100, spawn.z + 1.94013400, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_16_Ap_Mid_Pants4`, spawn.x + 7.55366500, spawn.y - 0.25457100, spawn.z + 1.33009200, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`V_16_Ap_Mid_Pants5`, spawn.x + 7.76753200, spawn.y + 3.00476500, spawn.z + 1.33052800, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`v_club_vuhairdryer`, spawn.x + 8.12616000, spawn.y - 2.50562000, spawn.z + 1.96009390, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        if not Config.Houses[insideHouse].data.takeableSpawned then
            local tv = CreateObject(`Prop_TV_Flat_01`, spawn.x - 5.53120400, spawn.y + 0.76299670, spawn.z + 2.17236000, false, false, false)
            FreezeEntityPosition(tv, true)	
            SetEntityHeading(tv, GetEntityHeading() + 90)
            TriggerServerEvent('dg-houserobbery:server:TakeableSpawned', insideHouse)
        end
    elseif tier == "big" then
        objects[#objects+1] = CreateObject(`micheal_shell`, spawn.x, spawn.y, spawn.z, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
    
        objects[#objects+1] = CreateObject(`v_res_ovenhobmod`, spawn.x + 7.11616000, spawn.y + 5.6062000, spawn.z + 0.6203, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`v_res_ovenhobmod`, spawn.x + 8.00876000, spawn.y + 5.6062000, spawn.z + 0.6203, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        
        objects[#objects+1] = CreateObject(`apa_mp_h_stn_sofacorn_01`, spawn.x - 2.23024, spawn.y - 5.9684600, spawn.z + 0.8349, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)
        
        objects[#objects+1] = CreateObject(`apa_mp_h_str_avunits_01`, spawn.x - 1.48765600, spawn.y - 11.9656, spawn.z + 0.8349, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`v_res_m_dinetble_replace`, spawn.x + 8.07676, spawn.y - 2.2142, spawn.z + 0.8581, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_mbchair`, spawn.x + 8.79056, spawn.y - 1.5427, spawn.z + 0.8604, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 315)
        
        objects[#objects+1] = CreateObject(`v_res_mbchair`, spawn.x + 7.37686, spawn.y - 1.5945, spawn.z + 0.8604, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 45)
        
        objects[#objects+1] = CreateObject(`v_res_mbchair`, spawn.x + 7.38636, spawn.y - 2.9317, spawn.z + 0.8604, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 135)
        
        objects[#objects+1] = CreateObject(`v_res_mbchair`, spawn.x + 8.74406, spawn.y - 2.883, spawn.z + 0.8604, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 225)
        
        objects[#objects+1] = CreateObject(`v_res_mconsolemod`, spawn.x - 5.55194, spawn.y - 2.2877, spawn.z + 4.7544, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)
        
        objects[#objects+1] = CreateObject(`v_res_m_armoire`, spawn.x + 2.45376, spawn.y - 5.1888, spawn.z + 4.7544, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_mdbed`, spawn.x + 0.78096, spawn.y - 8.8889, spawn.z + 4.771, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)
        
        objects[#objects+1] = CreateObject(`apa_mp_h_bathtub_01`, spawn.x - 1.48214, spawn.y - 11.2114, spawn.z + 4.7585, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)
        
        objects[#objects+1] = CreateObject(`prop_toilet_01`, spawn.x - 2.79564, spawn.y - 11.3553, spawn.z + 4.7538, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)
        
        objects[#objects+1] = CreateObject(`prop_sink_06`, spawn.x - 3.03954, spawn.y - 8.6854, spawn.z + 4.7531, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)
        
        objects[#objects+1] = CreateObject(`prop_towel_rail_01`, spawn.x - 0.68474, spawn.y - 9.4637, spawn.z + 5.5607, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)
        
        objects[#objects+1] = CreateObject(`prop_shower_rack_01`, spawn.x - 0.69474, spawn.y - 11.0642, spawn.z + 5.5607, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)
        
        objects[#objects+1] = CreateObject(`prop_toilet_soap_02`, spawn.x - 0.82164, spawn.y - 11.0668, spawn.z + 5.6127, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)
        
        objects[#objects+1] = CreateObject(`apa_mp_h_bed_with_table_02`, spawn.x - 7.87674, spawn.y + 5.9472, spawn.z + 4.7629, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`apa_p_h_acc_artwalll_02`, spawn.x - 7.86444, spawn.y + 5.9283, spawn.z + 5.6751, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_med_p_desk`, spawn.x - 6.80674, spawn.y - 1.93183, spawn.z + 4.7536, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)
        
        objects[#objects+1] = CreateObject(`v_club_officechair`, spawn.x - 7.97964, spawn.y - 2.2074, spawn.z + 4.7735, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 103)
        
        objects[#objects+1] = CreateObject(`v_corp_offshelf`, spawn.x - 10.9832, spawn.y - 2.2, spawn.z + 4.7586, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)
        
        objects[#objects+1] = CreateObject(`prop_laptop_01a`, spawn.x - 7.10454, spawn.y - 1.7372, spawn.z + 5.5023, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 283)
        
        objects[#objects+1] = CreateObject(`prop_mouse_01b`, spawn.x - 7.21634, spawn.y - 2.0773, spawn.z + 5.5035, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)
        
        objects[#objects+1] = CreateObject(`v_res_fh_coftbldisp`, spawn.x - 0.365654, spawn.y - 8.1713, spawn.z + 0.8478, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)

        objects[#objects+1] = CreateObject(`apa_mp_h_stn_chairarm_12`, spawn.x + 2.40106, spawn.y - 10.2779, spawn.z + 0.8478, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 240)
        
        objects[#objects+1] = CreateObject(`apa_mp_h_stn_chairstool_12`, spawn.x + 1.51176, spawn.y - 9.764, spawn.z + 0.8478, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 240)

        objects[#objects+1] = CreateObject(`prop_cs_kitchen_cab_l`, spawn.x + 9.92616000, spawn.y + 5.7062000, spawn.z + 1.645, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_m_vasefresh`, spawn.x - 8.11436, spawn.y - 2.1717, spawn.z + 1.6992, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_ret_gc_lamp`, spawn.x - 6.758, spawn.y - 2.763, spawn.z + 5.5, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)
        
        objects[#objects+1] = CreateObject(`v_res_msonbed`, spawn.x - 6.165, spawn.y - 10.639, spawn.z + 4.763, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`v_res_cabinet`, spawn.x - 4.387, spawn.y + 4.302, spawn.z + 4.678, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)
        
        objects[#objects+1] = CreateObject(`v_res_m_sidetable`, spawn.x + 4.728, spawn.y - 2.275, spawn.z + 4.753, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)

        objects[#objects+1] = CreateObject(`apa_mp_h_acc_artwallm_04`, spawn.x - 5.859, spawn.y - 2.277, spawn.z + 6.119, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_d_dressingtable`, spawn.x - 3.543, spawn.y + 1.2602, spawn.z + 4.753, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)

        objects[#objects+1] = CreateObject(`v_res_mbbedtable`, spawn.x - 4.813, spawn.y - 11.703, spawn.z + 4.763, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_mbbedtable`, spawn.x - 7.518, spawn.y - 11.697, spawn.z + 4.753, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_d_dressingtable`, spawn.x + 1.411, spawn.y - 11.608, spawn.z + 4.753, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`apa_mp_h_str_sideboardl_11`, spawn.x - 0.176, spawn.y - 1.24, spawn.z + 0.848, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`ex_mp_h_acc_artwallm_02`, spawn.x - 0.176, spawn.y - 1.189, spawn.z + 2.163, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_med_p_planter`, spawn.x - 2.034, spawn.y - 1.639, spawn.z + 0.859, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_mcupboard`, spawn.x + 0.93716, spawn.y + 0.3832, spawn.z + 0.374, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`prop_golf_bag_01c`, spawn.x - 10.653, spawn.y + 5.15, spawn.z + 0.183, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`apa_mp_h_acc_dec_head_01`, spawn.x - 8.126, spawn.y - 0.075, spawn.z + 1.267, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`apa_mp_h_acc_dec_sculpt_02`, spawn.x - 7.547, spawn.y - 0.075, spawn.z + 1.267, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`v_res_r_sofa`, spawn.x - 7.62, spawn.y + 5.255, spawn.z + 0.167, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`ex_mp_h_acc_artwallm_02`, spawn.x - 7.595, spawn.y + 5.884, spawn.z + 1.564, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_mconsolemod`, spawn.x - 7.799, spawn.y + 0.537, spawn.z + 0.173, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 180)

        objects[#objects+1] = CreateObject(`v_res_mbbedtable`, spawn.x + 1.458, spawn.y + 5.495, spawn.z + 3.015, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_rubberplant`, spawn.x + 1.491, spawn.y + 5.524, spawn.z + 3.565, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_club_officesofa`, spawn.x - 7.932, spawn.y - 7.054, spawn.z + 4.768, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_tre_storagebox`, spawn.x - 3.832, spawn.y - 7.528, spawn.z + 4.763, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_club_vu_lamp`, spawn.x - 4.832, spawn.y - 11.730, spawn.z + 5.313, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fh_speakerdock`, spawn.x - 7.53, spawn.y - 11.632, spawn.z + 5.3, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_lightfan`, spawn.x - 1.276, spawn.y - 7.481, spawn.z + 4.162, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_sculpt_dec`, spawn.x - 4.868, spawn.y - 7.307, spawn.z + 3.098, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_sculpt_dece`, spawn.x - 4.903, spawn.y - 7.667, spawn.z + 2.112, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_r_figoblisk`, spawn.x - 4.842, spawn.y - 5.623, spawn.z + 2.1, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_r_figflamenco`, spawn.x + 0.947, spawn.y - 1.451, spawn.z + 1.73, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_m_bananaplant`, spawn.x - 1.73, spawn.y + 2.15, spawn.z - 0.398, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)

        objects[#objects+1] = CreateObject(`ba_prop_battle_trophy_battler`, spawn.x - 4.958, spawn.y - 9.021, spawn.z + 2.097, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`ba_prop_battle_trophy_no1`, spawn.x - 4.899, spawn.y - 9.309, spawn.z + 2.097, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`prop_bong_01`, spawn.x - 4.851, spawn.y - 9.808, spawn.z + 2.097, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_tre_tree`, spawn.x + 4.654, spawn.y - 4.830, spawn.z + 0.848, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_fh_sculptmod`, spawn.x - 3.761, spawn.y - 11.148, spawn.z + 0.858, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_r_figfemale`, spawn.x - 4.933, spawn.y - 6.174, spawn.z + 2.109, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_r_figcat`, spawn.x - 4.942, spawn.y - 5.07, spawn.z + 3.1, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`v_res_sculpt_decf`, spawn.x - 4.903, spawn.y - 5.93, spawn.z + 3.1, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_r_fighorsestnd`, spawn.x - 4.978, spawn.y - 5.157, spawn.z + 2.109, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 90)

        objects[#objects+1] = CreateObject(`v_res_fashmagopen`, spawn.x - 0.304, spawn.y - 1.464, spawn.z + 1.725, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        objects[#objects+1] = CreateObject(`prop_ld_int_safe_01`, spawn.x - 7.078, spawn.y - 0.925, spawn.z + 4.525, false, false, false)
        FreezeEntityPosition(objects[#objects], true)
        SetEntityHeading(objects[#objects], GetEntityHeading(objects[#objects]) + 270)

        objects[#objects+1] = CreateObject(`ba_prop_battle_lights_ceiling_l_c`, spawn.x - 1.489, spawn.y + 1.703, spawn.z + 5.858, false, false, false)
        FreezeEntityPosition(objects[#objects], true)

        if not Config.Houses[insideHouse].data.takeableSpawned then
            local vaas = CreateObject(`v_med_p_vaseround`, spawn.x - 1.381, spawn.y - 1.561, spawn.z + 1.725, false, false, false)
            FreezeEntityPosition(vaas, true)	
            TriggerServerEvent('dg-houserobbery:server:TakeableSpawned', insideHouse)
        end
    end

    Citizen.CreateThread(function()
        local ped = PlayerPedId()
        local coords = spawn - Config.Interiors[tier].exit.offset + Config.ZOffset
        SetEntityCoords(ped, coords.x, coords.y, coords.z, 0, 0, 0, false)
        SetEntityHeading(ped, Config.Interiors[tier].exit.heading)

        DoScreenFadeIn(1000)
    end)

    return objects
end