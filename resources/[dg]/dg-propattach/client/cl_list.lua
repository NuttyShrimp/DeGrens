props = {
	phone = {
		model = `prop_player_phone_01`,
		boneId = 28422,
		--x = 0.14,
		--y = 0.01,
		--z = -0.02,
		--rx = 110.0,
		--ry = 120.0,
		--rz = -15.0,
		x = 0.0,
		y = 0.0,
		z = 0.0,
		rx = 0.0,
		ry = 0.0,
		rz = -0.0,
	},
	crttv = {
		model = `prop_tv_06`,
		boneId = 24818,
		x = 0.0,
		y = 0.4,
		z = 0.0,
		rx = -7.25,
		ry = 89.9,
		rz = 8.5,
	},
	tv = {
		model = `prop_tv_flat_02`,
		boneId = 24818,
		x = 0.0,
		y = 0.4,
		z = 0.0,
		rx = -6.05,
		ry = 91.9,
		rz = 6.05,
	}, 
	vaas = {
		model = `v_med_p_vaseround`,
		boneId = 24818,
		x = -0.20,
		y = 0.45,
		z = 0.25,
		rx = 0.35,
		ry = 163.65,
		rz = 0.0,
	},
    cardbox = {
        model = `prop_cs_cardbox_01`,
        boneId = 24818,
		x = -0.1,
		y = 0.4,
		z = 0.02,
		rx = -7.25,
		ry = 89.9,
		rz = 8.5,
    }
}

-- these groups define items that cannot coexist
uniqueItems = {
    [1] = {"crttv", "tv", "vaas"},
}