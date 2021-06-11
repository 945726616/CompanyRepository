(function(window) {
    var g_refreshTimeoutID,g_devsNum,g_play_button,g_device_list_ul,g_device_html = "",g_record_button,g_talk_button,g_dev_default_pass,g_is_find_peripheral,
        g_devs=[],g_selectedDevice,g_playing_mme,g_record_flag,g_activation_div,g_ip_start_input,
        g_ip_end_input,g_test_ul,g_test_result_div,g_test_array_names=[],g_test_array_index,g_test_select_array=[],g_test_checkbox,
        g_main_page_div,g_auto_refresh_input,g_dev_upgrade_div,g_version_info_span,g_restore_div,g_valid_version,
        g_upgrade_button,g_dev_site_div,g_view_page,g_sd_info_flag,g_set_mode_flag,g_wifi_list_flag,g_alarm_action_flag,
        g_auto_test_flag,g_default_pass_input,g_test_button,g_wifi_ssid_input,g_wifi_pass_input,g_play_flag,g_wifi_connect_flag,
        g_wifi_connect_button,g_switch_versions_button,g_test_arrays,g_test_version,g_os_version_span,g_version_sensor_wifi,g_dev_uptime;
    var g_auto_refresh_dev,g_select_dev,g_click_refresh_btn = false,g_check = false,g_remove_timer,g_timer,g_input_pwd,g_all_data = [],g_play_cell = [],g_definition,obj = {};
    var g_mcloud_agent = new mcloud_agent();
    var g_mcloud_account = new mcloud_account();
    var g_mlocal_storage = window.mlocal_storage;
    var $$ = function(v) {return document.getElementById(v);};
    var g_devs_ver;
    var g_inner_window_info = {dom_id:("inner_window1"), video_chls:null, audio_chls:null, mme:null, ipc_state:"", node_sn:""};

    Array.prototype.removeItem = function(val) {
        for(var i = 0;i < this.length;i++) {
            if(this[i] == val) {
                this.splice(i, 1);
                break;
            }
        }
    }


	/*var g_test_arrays={
	    wifi_list:{quest:"wifi搜索功能是否正常？"},
        wifi_connect:{quest:""},
        sd_info:{quest:""},
        set_alarm_action:{quest:"IO报警是否正常？"},
        play:{quest:"视频显示是否正常？"},
        talk:{quest:"对讲是否正常？"},
        night:{quest:"夜间模式功能是否正常？"},
        day:{quest:"白天模式功能是否正常？"},
        auto:{quest:"自动模式功能是否正常？"},
        scan:{quest:"云台是否正常？"},
        wps:{quest:"wps功能是否正常？"}
    };*/
    function test(type) {
		switch(type)
		{
		    case "init":
		        init();
		        break;
		    case "switch_versions":
                // init_test_list(switch_versions_button.textContent=="切换到所有"?1:0);
		        break;
		    case "refresh_device":
		        set_button_disable(true);
                g_click_refresh_btn = true;
		        if(g_refresh_device_button.textContent!="搜索 (Ctrl + R)")
		        {
		            if(g_refreshTimeoutID)clearTimeout(g_refreshTimeoutID);
		            g_refresh_device_button.textContent="搜索 (Ctrl + R)";
		            return;
		        }
		        refresh_devs();
		        break;
		     case "play":
		        if(!g_play_flag)
		        {
		           g_play_flag=1;
                   g_view_page.style.background="";
		           create_mme({inner_window_info:g_inner_window_info,page:"home",protocol:"auto",dom:$$("view_page")});
		           g_play_button.textContent="停止";
		        }
		        else
		        {
		            video_destroy();
		            set_preview();
		        }
		          break;
		     // case "record":
		          // record();
		          // break;
		     // case "snapshot":
		           // var url;
                   // url=(g_selectedDevice.version.substr(0,2)<"v2")?("http://" +g_mcloud_account.get_srv()+ "/ccm/CcmGetImageRequest.jpg?hfrom_handle=887330&dSession=1&dSession_Nid="+g_mcloud_agent.create_nid()+"&dSession_SerialNumber="+g_selectedDevice.name+"&dtoken=p0_xxxxxxxxxx"):
                        // (url="http://" +mcloud_account.get_srv()+ "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid="+g_mcloud_agent.create_nid()+"&dsess_sn="+g_selectedDevice.name+"&dtoken=p0_xxxxxxxxxx");
                   // create_snapshot_view (g_main_page_div,url);
		          // break;
		     case "audio_out":
		     case "audio_in":
		     case "talk":
		          talk ();
		          break;
		     case "sd_info":
		          get_sd_info (g_sd_info_flag);
		          break;
		     case "set_mode":
		          set_mode ({flag:g_set_mode_flag});
		          break;
		     case "auto":
		     case "day":
		     case "night":
		          set_mode ({type:type});
		          break;
		    case "wifi_list":
                  get_wifi_list (g_wifi_list_flag);
                  break;
		    case "wifi_connect":
                  set_wifi_connect ();
                  break;
            case "peripheral":
             get_peripheral();
             break;
             case "support_peripheral":
                support_peripheral();
                break;
            case "rf":
                rf();
                break;
		    case "wps":
		    case "appearance":
		    case "equ_conn":
		    case "infrared_lamp":
		    case "focusing":
		    case "color_correction":
		    case "grey_board":
		    //case "set_alarm_action":
		    case "low_light":
		    case "high_light":
		    case "wifi_ip":
		    case "check_id":
		    case "pass":
		    case "reset":
		    case "sd_push":
		          test_next();
                  break;
		    case "set_alarm_action":
                  set_alarm_action(1);
                  test_next();
                  break;
		     case "left_move":
		     case "up_move":
		     case "right_move":
             case "yuntai":
		     case "down_move":
		     case "scan":
		          camera_control (type);
		          test_next();
		          break;
		     case "activate":
		          var activate_code=$$("activate_input").value;
                  g_mcloud_agent.dev_activate({sn:g_selectedDevice.name,activationCode:activate_code},null,function(msg,ref){
                      if(msg.result)
                      {
                          system_pop_confirm_box({alert:true,index:1,str:"activate error: "+msg.result});
                      }
                      else
                      {
                          $$("activate_input").value="";
                          g_activation_div.style.display = "none";
                          g_mcloud_agent.svr_dev_get(null,function(msg, ref){
                                if(msg.result=="")
                                {
                                    var sn=msg.sn;
                                    var index=dev_index_get(g_selectedDevice.name);
                                    dev_info_set({name:sn,version:msg.ver});
                                    g_selectedDevice.name=sn;
                                    $$("device_list_li_"+index).innerHTML=sn;
                                    $$("device_list_li_"+index).title="IP："+g_selectedDevice.ip+"\nVersion："+msg.ver;
                                    $$("activate_input").value="";
                                }
                            });
                      }
                  });
		          break;
		     case "auto_test":
		          if(g_test_button.textContent=="开始测试")
		          {
		              g_test_button.textContent="停止测试";
		              auto_test ();
		          }
		          else
		          {
		          	  g_is_find_peripheral=0;
		              g_test_button.textContent="开始测试";
		              stop_test ();
		          }
		          break;
		     case "upgrade":
		          upgrade ();
		          break;
		     case "restore":
		          system_pop_confirm_box({quest:"恢复出厂设置，需要重启设备，是否继续？",index:2,callback_func:function(type){
		              if(type)
		              g_mcloud_agent.restore({sn:g_selectedDevice.name,keep_extends_cofig:0},null,
                        function(msg,ref){
                            if(msg.result)
                            {
                                system_pop_confirm_box({alert:true,index:1,str:"restore error: "+msg.result});
                            }
                            else
                            {
                                g_mcloud_agent.reboot({sn:g_selectedDevice.name},null,
                                    function(msg,ref){msg.result?system_pop_confirm_box({alert:true,index:1,str:"reboot error: "+msg.result}):"";});
                            }
                        });
		          }});
		          break;
             case "lang_set":
                lang_set();
                break;
             case "lang_get":
                lang_get();
                break;
            case "click_back":
                click_back();
                break;
		}
	}

    var outCountNumD = 0;
    var errArray = [];
    var goodArray = [];
    var errItemObj = [];
    var sucArray = [];
    var hasIDArray = [];
    var removeArrayID = []
    g_click_refresh_btn = true;

	function click_back() {
        jQuery("#currentIDShow").html("");

        jQuery("#page_left").show();
        jQuery("#page_top_one").show();

        jQuery("#page_top_two").hide();
        jQuery("#page_center").hide();
        jQuery("#page_right").hide();
        jQuery("#showProgressView > img").hide();

        if (jQuery("#system_tooltip")){
            jQuery("#system_tooltip").remove();
        }

        g_click_refresh_btn = false;
        if (jQuery("#search")){
            jQuery("#search").remove();
        }
        refresh_devs();
    };

	function init() {
        g_main_page_div = $$("main_page");
        g_device_list_ul =$$("device_list_ul");
        g_play_button=$$("play_button");
        //g_record_button =$$("record_button");
        g_talk_button=$$("talk_button");
        g_activation_div=$$("activation_div");
        g_ip_start_input=$$("ip_start");
        g_ip_end_input=$$("ip_end");
        g_test_ul=$$("test_ul");
        g_test_result_div = $$("test_result_div");
        g_auto_refresh_input=$$("auto_refresh_input");
        g_refresh_device_button=$$("refresh_device");
        g_os_version_span=$$("os_version_span");
        g_version_info_span=$$("version_info_span");
        g_dev_upgrade_div=$$("dev_upgrade_div");
        g_restore_div=$$("restore_div");
        g_upgrade_button=$$("upgrade_button");
        g_dev_site_div=$$("dev_site_div");
        g_view_page=$$("view_page");
        g_default_pass_input=$$("default_pass_input");
        g_test_button=$$("test_button");
        g_wifi_ssid_input=$$("wifi_ssid_input");
        g_wifi_pass_input=$$("wifi_pass_input");
        g_wifi_connect_button=$$("wifi_connect_button");
        // g_switch_versions_button=$$("switch_versions_button");
        g_version_sensor_wifi=$$("version_sensor_wifi");
        g_dev_uptime=$$("dev_uptime");
        g_set_mode_flag=1;
        g_wifi_list_flag=1;
        g_wifi_connect_flag=1;
        g_play_flag=0;
        var select_checkbox=$$("select_checkbox");
        window.onresize=function(){
            var client_w=document.body.clientWidth;
            var client_h=document.body.clientHeight;
            g_main_page_div.style.width=client_w;
            g_main_page_div.style.height=client_h;
            g_view_page.style.width=client_w*0.7;
            g_view_page.style.height=client_h*0.76;
            layoutCell();
        }

        g_test_button.onkeydown=function()
        {
            if(event.keyCode==13) return false;
        }
        var localVal=g_mlocal_storage.get("ip_range");
        if(localVal){
            var ipVal= eval('(' + localVal + ')').ip;
            g_ip_start_input.value=ipVal.substr(0,ipVal.indexOf("-"));
            g_ip_end_input.value=ipVal.substr(ipVal.indexOf("-")+1,ipVal.length);
            if(eval('(' + localVal + ')').checked)
            {
                g_auto_refresh_input.checked="checked";
                refresh_devs();
            }
        }
        g_auto_refresh_input.onchange=function() {
            (g_auto_refresh_input.checked)?set_storage_data({str:"ip_range", data:{ip:g_ip_start_input.value+"-"+g_ip_end_input.value,checked:1}}):set_storage_data({str:"ip_range", data:{ip:g_ip_start_input.value+"-"+g_ip_end_input.value,checked:0}});
        }
        function setPassWord() {
            // var local_dev_pass = g_mlocal_storage.get("dev_pass");
            jQuery("#default_pass_input").blur(function () {
                localStorage.setItem("dev_pass",jQuery("#default_pass_input").val());
            });
            var local_dev_pass = localStorage.getItem("dev_pass");
            if(local_dev_pass)
            {
                g_dev_default_pass = local_dev_pass;
                g_default_pass_input.value = g_dev_default_pass;
            } else{
                localStorage.setItem("dev_pass",jQuery("#default_pass_input").val());
            }
        }
        setPassWord();

        function setDefinition() {
            jQuery("#playDefinition").blur(function () {
                localStorage.setItem("definition",jQuery("#playDefinition").val());
            })
            if (localStorage.getItem("definition")){
                jQuery("#playDefinition").val(localStorage.getItem("definition"));
            }
        }
        setDefinition();
        var local_wifi_info=g_mlocal_storage.get("wifi_info");
        if(local_wifi_info&& eval('(' + local_wifi_info + ')').pass) {
            var local_wifi_info_ssid=eval('(' + local_wifi_info + ')').ssid;
            var local_wifi_info_pass=eval('(' + local_wifi_info + ')').pass;
            g_wifi_ssid_input.value=local_wifi_info_ssid;
            g_wifi_pass_input.value=local_wifi_info_pass;
        }
        else{
            set_storage_data({str:"wifi_info", data:{ssid:"",pass:"12345678"}});
        }
        g_wifi_ssid_input.onchange=g_wifi_pass_input.onchange=wifi_connnect_change;
        function wifi_connnect_change() {
            set_storage_data({str:"wifi_info", data:{ssid:g_wifi_ssid_input.value,pass:g_wifi_pass_input.value}});
        }

        var local_test_version=g_mlocal_storage.get("test_version");
        g_test_version=local_test_version?eval('(' + local_test_version + ')').version:0;
        init_test_list(g_test_version);
        update_test_datebase();
        set_button_disable(true);

        g_check = jQuery("#auto_refresh_input").is(':checked');
        jQuery("#auto_refresh_input").click(function () {
            g_check = jQuery("#auto_refresh_input").is(':checked');
            if (g_check){
                if(g_auto_refresh_dev){
                    clearInterval(g_auto_refresh_dev);
                }
                g_auto_refresh_dev = setInterval(function(){
                    if (!g_check){
                        clearInterval(g_auto_refresh_dev);
                    }
                    obj.mme.ctrl(0,"mbc.send",send_params);
                },2000)
            }
        })
	}

	function update_test_datebase() {
	    g_test_checkbox=g_test_ul.getElementsByTagName("input");
	    var local_test_select=g_mlocal_storage.get("test_select"+g_test_version);
        var temp_checked=eval('(' + local_test_select + ')');
        if(local_test_select&& temp_checked)
        {
            if(temp_checked.length==11) select_checkbox.checked=true;
            for(var i=0;i<g_test_checkbox.length;i++)
            {
                for(var j=0;j<temp_checked.length;j++)
                {
                    if(g_test_checkbox[i].id==temp_checked[j])
                    {
                        g_test_checkbox[i].checked=true;
                    }
                }
            }
        }
        select_checkbox.onchange=function()
        {
            var save_test_array=[];
            for(var i=0;i<g_test_checkbox.length;i++)
            {
                 if(g_test_checkbox[i].id!="select_checkbox")
                 {
                     if(select_checkbox.checked)
                     {
                         g_test_checkbox[i].checked=true;
                         save_test_array[i]=g_test_checkbox[i].id;
                     }
                     else
                     {
                         g_test_checkbox[i].checked=false;
                         save_test_array.length=0;
                     }

                 }
            }
            set_storage_data({str:"test_select"+g_test_version, data:save_test_array});
        }
        for(var i=0;i<g_test_checkbox.length;i++)
        {
            if(g_test_checkbox[i].id!="select_checkbox")
                g_test_checkbox[i].onchange=function(e)
                {
                    var local_test_select=g_mlocal_storage.get("test_select"+g_test_version);
                    var temp_checked_array=local_test_select?eval('(' + local_test_select + ')'):[];
                    var temp_checkbox=e.currentTarget;
                    var chekbox_id=temp_checkbox.id;
                    if(local_test_select&& temp_checked_array)
                    {
                        if(temp_checkbox.checked)
                        {
                                var flag=0;
                                for(var j=0;j<temp_checked_array.length;j++)
                                {
                                    if(chekbox_id==temp_checked_array[j])
                                    {
                                        flag=1;
                                    }
                                }
                                if(!flag) temp_checked_array.push(chekbox_id);
                        }
                        else
                        {
                            if(select_checkbox.checked) select_checkbox.checked=false;
                            for(test_tmp in temp_checked_array)
                            {
                                if(chekbox_id==temp_checked_array[test_tmp]){
                                    temp_checked_array.splice(test_tmp,1);
                                }
                            }
                        }
                    }
                    else if(temp_checkbox.checked) temp_checked_array.push(chekbox_id);
                    set_storage_data({str:"test_select"+g_test_version, data:temp_checked_array});
                };

        }
	}
	function init_test_list(type) {
        type = 1;
        g_test_arrays=window.web_test_list.get_test_list(type);
        g_test_ul.innerHTML=window.web_test_list.get_test_list_innerHTML(type);
        set_storage_data({str:"test_version", data:{version:type}});
        // switch_versions_button.textContent=type?"切换到常用":"切换到所有";
        g_test_version=type;
        update_test_datebase();
	}


	function set_button_disable(bool)
	{
        var button_arrays=document.getElementsByTagName("button");
        for(var i=0;i<button_arrays.length;i++)
        {
            if(button_arrays[i].id!="refresh_device" && button_arrays[i].id!="switch_versions_button")
            {
                button_arrays[i].disabled=bool;
                if(bool)
                {
                    button_arrays[i].style.cursor="auto";
                }
                else
                {
                    button_arrays[i].style.cursor="pointer";
                    var orign_color;
                    button_arrays[i].onmouseover=function(){orign_color=event.srcElement.style.backgroundColor;event.srcElement.style.backgroundColor="#73BF00";};
                    button_arrays[i].onmouseout=function(){event.srcElement.style.backgroundColor=orign_color};
                }
            }
        }
	}

	function set_fix()
	{
	    if(g_selectedDevice.spv!="v1")
        {
            g_mcloud_agent.set_fix(
            {
                type:function(type){
                    var fix_types={
                        "ccm_play":"GetStreamUriRequest",
                        "ccm_talk":"CcmGetAudioOutputStreamUriRequest",
                        "ccm_disk_get":"CcmGetDisksRequest",
                        "ccm_net_get":"CcmGetNetworkInfoRequest",
                        "ccm_net_set":"CcmSetNetworkInfoRequest",
                        "ccm_alert_action_set":"CcmAlertActionSetRequest",
                        "ccm_ptz_ctl":"RelativeMoveRequest",
                        "ccm_active":"CcmClientActiveRequest",
                        "ccm_restore":"RestoreSystemRequest",
                        "ccm_reboot":"SystemRebootRequest",
                        "ccm_info_get":"CcmGetDeviceRequest",
                        "ccm_upgrade_get":"CcmGetUpgradeStatusRequest",
                        "ccm_upgrade":"CcmUpgradeRequest",
                        "ccm_record_task_get":"CcmGetRecordingTaskConfigurationRequest",
                        "ccm_record_task_set":"CcmSetRecordingTaskConfigurationRequest",
                        "ccm_img_set":"SetImagingSettingsRequest",
                        "ccm_misc_set":"CcmSetSystemInfoRequest",
                        "ccm_img_get":"GetImagingSettingsRequest",
                        "ccm_misc_get":"CcmGetSystemInfoRequest"
                    };
                    return fix_types[type] || type;
                },
                req:function(type, req){
                    var temp_req=req;
                    req.length=0;
                    req=get_fix_req(type,temp_req);
                    return req;
                },
                ack:function(type, ack){
                    var temp_ack=ack.data;
                    ack=null;
                    ack=get_fix_ack(type,temp_ack);
                    return ack;
                }
            });
            function get_fix_req(type,temp_req)
            {
                var fix_reqs;
                switch(type)
                {
                    case "ccm_play":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},StreamSetup:{Stream:temp_req.setup.stream,Transport:{Protocol:temp_req.setup.trans.proto}},ProfileToken:temp_req.token};
                       break;
                    case "ccm_talk":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},
                                    StreamSetup:{Stream:temp_req.setup.stream,Transport:{Protocol:temp_req.setup.trans.proto}},ProfileToken:temp_req.token};
                       break;
                    case "ccm_disk_get":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn}};
                       break;
                    case "ccm_net_get":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},tokens:temp_req.tokens,items:temp_req.items,force_scan:temp_req.force_scan};
                       break;
                    case "ccm_net_set":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},net_info:temp_req.info};
                       break;
                    case "ccm_alert_action_set":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},Enable:temp_req.enable,Actions:{Token:temp_req.actions.token,Enable:temp_req.actions.enable,Name:temp_req.actions.name,Sources:[{Devices:[temp_req.actions.srcs[0].devs[0]]}],IoOutputEnable:1,SnapshotEnable:1,RecordEnable:1,SnapshotInterval:0,PreRecordTime:3}};
                       break;
                    case "ccm_ptz_ctl":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},
                                                Translation:{PanTilt:{x:temp_req.trans.pan_tilt.x, y:temp_req.trans.pan_tilt.y}}};
                       break;
                    case "ccm_active":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},ActivationCode:temp_req.ActivationCode};
                       break;
                    case "ccm_restore":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},Backup:temp_req.backup};
                       break;
                    case "ccm_reboot":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn}};
                       break;
                    case "ccm_record_task_get":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn}};
                       break;
                    case "ccm_record_task_set":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},TaskConfiguration:{immediate:temp_req.task.keep}};
                       break;
                    case "ccm_img_set":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},VideoSourceToken:temp_req.token,ImagingSettings:{Brightness:temp_req.conf.brightness,Contrast:temp_req.conf.contrast,ColorSaturation:temp_req.conf.color_saturation,Sharpness:temp_req.conf.sharpness,mode:temp_req.conf.mode}};
                       break;
                    case "ccm_misc_set":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},info:temp_req.info};
                       break;
                    case "ccm_img_get":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},VideoSourceToken:temp_req.token};
                       break;
                    case "ccm_misc_get":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn}};
                       break;
                   case "ccm_info_get":
                       fix_reqs={};
                       break;
                   case "ccm_upgrade_get":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},CheckVersion:temp_req.check};
                       break;
                   case "ccm_upgrade":
                       fix_reqs={Session:{Nid:temp_req.sess.nid,SerialNumber:temp_req.sess.sn},FirmwareSrc:temp_req.img_src};
                       break;
                }
                return fix_reqs;
            }
            function get_fix_ack(type,temp_ack)
            {
                var fix_acks;
                switch(type)
                {
                    case "ccm_play":
                       fix_acks={data:{result:temp_ack.Result.Reason,uri:{url:temp_ack.MediaUri.Uri}}};
                       break;
                    case "ccm_talk":
                       fix_acks={data:{result:temp_ack.Result.Reason,uri:{url:temp_ack.MediaUri.Uri}}};
                       break;
                    case "ccm_disk_get":
                       fix_acks={data:{result:temp_ack.Result.Reason,disks:[{conf:{enable:temp_ack.Disks[0].sd_conf.enable},stat:temp_ack.Disks[0].status,size:temp_ack.Disks[0].TotalSize,used_size:temp_ack.Disks[0].UsedSize,available_size:temp_ack.Disks[0].AvailableSize}]}};
                       break;
                    case "ccm_net_get":
                       fix_acks={data:{result:temp_ack.Result.Reason,info:temp_ack.net_info}};
                       break;
                    case "ccm_net_set":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_alert_action_set":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_ptz_ctl":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_active":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_restore":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_reboot":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_record_task_get":
                       fix_acks={data:{result:temp_ack.Result.Reason,sd_ready:temp_ack.sd_ready,task:temp_ack.TaskConfiguration}};
                       break;
                    case "ccm_record_task_set":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_img_set":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_misc_set":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                    case "ccm_img_get":
                       fix_acks={data:{result:temp_ack.Result.Reason,conf:{brightness:temp_ack.ImagingSettings.Brightness,contrast:temp_ack.ImagingSettings.Contrast,color_saturation:temp_ack.ImagingSettings.ColorSaturation,sharpness:temp_ack.ImagingSettings.Sharpness,mode:temp_ack.ImagingSettings.mode}}};
                       break;
                    case "ccm_misc_get":
                       fix_acks={data:{result:temp_ack.Result.Reason,info:temp_ack.info}};
                       break;
                   case "ccm_info_get":
                       fix_acks={data:{sn:temp_ack.SerialNumber,result:temp_ack.Result.Reason,ver:temp_ack.Version}};
                       break;
                   case "ccm_upgrade_get":
                       fix_acks={data:{sn:temp_ack.SerialNumber,result:temp_ack.Result.Reason,stat:temp_ack.Status,progress:temp_ack.Progress,os_ver:temp_ack.os_ver,_cur_ver:temp_ack.CurrentVersion,_valid_ver:temp_ack.ValidVersion,remark:temp_ack.Remark,changes:temp_ack.changes}};
                       break;
                   case "ccm_upgrade":
                       fix_acks={data:{result:temp_ack.Result.Reason}};
                       break;
                }
                return fix_acks;
            }
      }else{
            g_mcloud_agent.set_fix(null);
	    }
	}

	function dev_get(name){
        for(var dev, i = 0; i < g_devs.length; ++i) {
            if((dev = g_devs[i]) && (dev.name == name)){ return dev; }
        }
        return null;
    }

    function dev_index_get(name)
    {
        for(var dev, i = 0; i < g_devs.length; ++i)
        {
            if((g_devs[i].name==g_selectedDevice.name)){ return i; }
        }
    }
    function dev_info_set (obj) {
        for(var dev, i = 0; i < g_devs.length; ++i)
        {
            if((g_devs[i].name==g_selectedDevice.name))
            {
                g_devs[i].name=obj.name;
                if(obj.version)g_devs[i].version=obj.version;
            }
        }
    }

	function dom_create_child(child_parent, child_type, child_id, child_class)
    {
        var child = document.createElement(child_type);
        if(child_id){child.setAttribute("id", child_id);}
        if(child_class){child.setAttribute("className", child_class);}         //for IE
        if(child_class){child.setAttribute("class", child_class);}
        if(child_parent){child_parent.appendChild(child);}
        return child;
    }
    function set_storage_data(obj) {
        var data_str = window.mcodec.obj_2_str (obj.data);
        g_mlocal_storage.set(obj.str, data_str);
    }
    function click_init() {
        if(g_talk_button.textContent=="对讲..") test("talk");
        //g_record_button.textContent="录像";
        set_mode ({flag:0});
        get_wifi_list (0);
        g_version_info_span.textContent="";
        g_version_sensor_wifi.textContent="";
        g_dev_uptime.textContent="";
        g_os_version_span.textContent="";
        $$("dev_site_ethernet").textContent="";
        $$("dev_site_wifi").textContent="";
        g_dev_upgrade_div.style.display = "none";
        g_restore_div.style.display = "none";
        g_activation_div.style.display = "none";
        g_dev_site_div.style.display = "none";
        stop_test();
        video_destroy();
        clear_test_content();
    }
    var count_dev_number = 0;

    var is_exist_ipc = [];
    var local_dev_data = [];
    var countNumD = 0;
    function refresh_devs() {
        if (g_click_refresh_btn){
            jQuery("#device_list_ul").html("");
            hasIDArray = [];
            outCountNumD = 0;
            errArray = [];
            errItemObj = [];
            sucArray = [];

            // 移除手动删除的id
            removeArrayID = [];
            obj={};
            is_exist_ipc = [];
            countNumD = 0;
        }

        g_definition = localStorage.getItem("definition");
        if (!g_definition){
            g_definition = jQuery("#playDefinition").val();
        }
        g_dev_default_pass = localStorage.getItem("dev_pass");
        var l_dom_search = dom_create_child(mx("#main_page"), "div", "search");
        l_dom_search.style.width="1px";

        function mme_on_event(e) {
            var local_devs_data;
            if(e.type == "ready"){
                function get_local_dev_req(num){
                    num++;
                    if(num>=30) return;
                    var  a=obj.mme.ctrl(0,"mbc.create","<aaa></aaa>");
                    var data = eval('('+a+')');
                    if(data.status==0){
                        function mme_send(counts){
                            counts++;
                            if(counts>=20)return;
                            send_params=JSON.stringify({type:"ProbeRequest",data:"{}"});
                            // var localVal=g_mlocal_storage.get("ip_range");
                            var localVal = jQuery("#auto_refresh_input").is(':checked');
                            var b;
                            if(localVal) {
                                if(g_auto_refresh_dev){
                                     clearInterval(g_auto_refresh_dev);
                                }
                                g_auto_refresh_dev = setInterval(function(){
                                    if (!g_check){
                                        clearInterval(g_auto_refresh_dev);
                                    }
                                    b = obj.mme.ctrl(0,"mbc.send",send_params);
                                },2000)
                            }
                            b = obj.mme.ctrl(0,"mbc.send",send_params);
                        }
                        mme_send(0);
                    }
                    else{
                        get_local_dev_req(num)
                    }
                }
                get_local_dev_req(0);
            } else if(e.type=="ProbeResponse"){
                count_dev_number++;
                local_devs_data= eval('('+mcodec.obj_2_str(e.data)+')');

                if (is_exist_ipc.indexOf(local_devs_data.sn) != -1) return;

                is_exist_ipc.push(local_devs_data.sn);
                local_dev_data.push(local_devs_data);
                create_plug_search_dev_list([local_devs_data],countNumD);
                outCountNumD = countNumD;
                countNumD++;
            }
        }
        var mme_params,
          ua = navigator.userAgent.toLowerCase(),
          url_params=(location.search || location.hash || "");
          params_key ='data:application/octet-stream;base64,NGO/Mnqt7aXYO3hdsIe87bCTuqTRRSPMwJGuT26CuSedGTi2h7wroHY0IZObBPKYA/exp+e/efFj35sLiDKQpRfRFz8Th8zlYtrYki24JiN7vpGb2bUN9nY7quZ56SicUoqLd+KcCrvWheZ5NaE+slPpCg+F+hUdhNl4JXbVxzx5U6jS92D/SBoDfpMTvF8n3ELgtVFOm3VG+22f97jzrRT22WqSzmmwsM5CNX3cwVfeM5vSPVzeo/kw0ERT9k1mdqG1lScyhMuYsgrWZ0zQSKUni7AUUoiO8qqSfW28XR6CJgp5/JiLHa0kAQtVCVxm886cpuLLUn2SJCHQwS985Fd6PH49IhI+ZgKK5NA+LX+qV3tHHkGdt0C+4n7AMOxHGB+iqepOiK13Bm3YkX7BB9uR80IAltc5YVA0CWg/jog8cCETr1pWm8XngSP4pJa4ZwJq5VuPcBKDTYzqXPJsnIDpZ7L+oz457Ysz+Cc7N7keTCXuI3aFPOjxvdAdCQqKb0Hra3LuxCr5FCfZxx/mn1rddD24Ol74WXtfRJqDs8K/zYpWMnuLU7NjTNdJGMjDs2zYpq56Vd2gq0sS+yyHyhvU4lcIxT05+YfiDMSznuF4BQuKyK7yxa0X73GjUNZFxV3lqIkGKWXjMf4rv4RyE2j1mEqgqGuAW+s2PZ35xOE';
          mme_params = {parent:l_dom_search, enable_native_plug:true,enable_flash_plug:true, params:mcodec.obj_2_str(params_key),
            on_event:mme_on_event,
            ref_obj:"",
            debug:(0 <= (location.search || location.hash || "").indexOf("debug=1"))};

            if(ua.match(/windows|win32/)){
               if(0 <= url_params.indexOf("windowless=0"))
                {
                  mme_params.windowless = false;
                }
               else if(0 <= url_params.indexOf("windowless=1"))
                {
                   mme_params.windowless = true;
                }
            }
            obj.mme = new mme(mme_params);
    }

    function setRemoveTimer() {
        if (g_remove_timer) clearInterval(g_remove_timer);
            g_remove_timer = setInterval(function () {
                if (removeArrayID.length > 0){
                    for (var i = 0;i < removeArrayID.length;i++){
                        is_exist_ipc.removeItem(removeArrayID[i]);
                    }
                    removeArrayID = [];
                }
            },1000 * 60 * 5);
    }
    setRemoveTimer();

    function layoutCell() {
        var getDocW = document.body.clientWidth;
        var paddingLeft = (getDocW - 450 * 3) / 3;
        jQuery("#device_list_ul").css({paddingLeft: paddingLeft + "px"});
    }

    function create_plug_search_dev_list(data,num){
        function li_add_click_event(){
            var l_dom_device_list = document.getElementsByClassName("device_list_li");
            for(var i=0;i<l_dom_device_list.length;i++){
                l_dom_device_list[i].onclick = li_click;
            }
        }
        function create_dom_device_li(){
            var str =
                    "<li id='"+ "device_list_li" + num + "' class='device_list_li' index='"+num+"' ip='"+data[0].ProbeMatch[0].XAddrs
                    +"' title='IP:"+data[0].ProbeMatch[0].XAddrs+"' style='cursor:pointer;"+(data[0].sn==g_select_dev?"color:#A8FF24;":"color:#fff;")
                    +"' id='device_list_li_"+num+"'>"
                    + data[0].sn
                    +"</li>";
            jQuery("#device_list_ul").append (str);
                layoutCell();
                new PlayCell({
                    device : {
                        ip : data[0].ProbeMatch[0].XAddrs,
                        name : data[0].sn,
                        pwd : g_dev_default_pass
                    },
                    windowInfo : {
                        dom_id:("inner_window" + num),
                        video_chls:null,
                        audio_chls:null,
                        mme:null,
                        ipc_state:"",
                        node_sn:""
                    },
                    domID : "UICollectionViewCell" + num,
                    parentNodeDom : "device_list_li" + num,
                    index : num,
                    definition : g_definition,
                    allData : function (msg) {
                        g_play_cell[msg.index] = msg;
                    },
                    oncall : function (msg) {
                        cellClick(msg);
                    },
                    errFun : function (item) {
                        if (errArray.indexOf(item.index) === -1){
                            errArray.push(item.index);
                            errItemObj.push(item);
                        }
                    },
                    sucFun : function (item) {
                        sucArray = [];
                        sucArray.push(item);
                        cellSucFun(item);
                    },
                    getInfo : create_search_dev_frame,
                    removeID : function (msg) {
                        // hasIDArray.removeItem(msg);
                        removeArrayID.push(msg);
                    }
                }).init();
                if (num === 0){
                    setLocalCssMark(0);
                }
        }
        create_dom_device_li();

    }

    function cellClick(cellMsg){
        console.log(cellMsg.index,"cellMsg.index===");
        if (errArray.indexOf(cellMsg.index) != -1){
            inputPwd(cellMsg.index);
            jQuery("#showProgressView > img").hide();
            return;
        }

        jQuery("#page_left").hide();
        jQuery("#page_top_one").hide();

        jQuery("#page_top_two").show();
        jQuery("#page_center").show();
        jQuery("#page_right").show();

        var tempPwd = cellMsg.pwd.toString();
        if (tempPwd != g_dev_default_pass){
            g_dev_default_pass = tempPwd;
        }
        var pwd = g_dev_default_pass;
        g_select_dev = this.innerHTML;
        var requestIP = cellMsg.ip || "";
        var num = cellMsg.index || "";
        var intStartTime=new Date();
        var refresh_dev_frame=dom_create_child(g_main_page_div, "iframe", "refresh_dev_frame");
        refresh_dev_frame.style.display="none";
        var doc = refresh_dev_frame.contentDocument || refresh_dev_frame.contentWindow.document;
        var temp_script = doc.createElement("script");
        temp_script.type = "text/javascript";
        temp_script.src = "http://"+requestIP+"/ccm/CcmGetDeviceRequest.js?hfrom_handle="+intStartTime;
        var head = doc.getElementsByTagName("head")[0];
        head.insertBefore(temp_script, head.firstChild);
        refresh_dev_frame.contentWindow.message=function(msg){
            jQuery("#currentIDShow").html("| 设备ID：" + cellMsg.id);
            if(jQuery("#refresh_dev_frame")){
                jQuery("#refresh_dev_frame").remove();
            }
            if(!dev_get(msg.data.SerialNumber)) {
                g_devs[0]={name:msg.data.SerialNumber,version:msg.data.Version?msg.data.Version:"v1",ip:requestIP,pwd:pwd,spv:msg.data.spv};
                connetIPC(cellMsg);
                g_devsNum++;
            }
        };
    }
    function connetIPC(msg) {
        console.log("connet_ipc",msg.index,msg);
        var num = msg.index;
        var pwd = msg.pwd.toString();
        var l_dom_device_list_li_ipc = document.getElementById("device_list_li" + num);
        var sn = msg.id;

        click_init();
        g_selectedDevice=dev_get(sn);

        if(g_selectedDevice) {
            l_dom_device_list_li_ipc.style.color="#A8FF24";
            g_mcloud_agent.set_srv(g_selectedDevice.ip);
            g_mcloud_account.set_srv(g_selectedDevice.ip);

            set_fix();
            // if(!$$("connect_dev_tip"))connect_dev_tip({parent:l_dom_device_list_li_ipc[num],type:1});
            g_mcloud_agent.sign_in({srv : g_selectedDevice.ip,user : g_selectedDevice.name,password : mmd5.hex(pwd)}, null, function(msg, ref) {
                // console.log("signIN",msg);
                // connect_dev_tip({parent:l_dom_device_list_li_ipc[num],type:0});
                if(!$$("system_tooltip"))system_tooltip({parent:l_dom_device_list_li_ipc,type:msg.result});
            });
        }else {
        }
    }

    function cellSucFun(item){
        // 如果存在,移除
        if (errArray.indexOf(item.index) != -1){
            errArray.removeItem(item.index);
            errItemObj.removeItem()
        }
    }
    function stopPropagation(event) {
        if(event.stopPropagation){
            event.stopPropagation();
        }else {
            event.cancelBubble = true;
        }
    }
    function preventDefault(event) {
        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false;
        }
    }
    function popPwdInput(item) {
        if (jQuery("#popViewBackground") || jQuery("#popView")){
            jQuery("#popViewBackground").remove();
            jQuery("#popView").remove();
            jQuery("#popViewBackground").remove();
        }
        var str =
            "<div id='popViewBackground'></div>"
            + "<div id='popView'>"
            + "<div style='width: 100%;'>设备ID："+ item.device.name +"</div>"
            + "<div style='width: 100%;'>请输入密码：</div>"
            + "<input id='g_input_pwd'/>"
            + "<a id='canclePop' >取消</a>"
            + "<a id='surePop' >确定</a>"
            + "</div>";
        jQuery("body").append(str);

        //action
        jQuery("#canclePop").click(function(){
            jQuery("#popView").remove();
            jQuery("#popViewBackground").remove();
        });
        jQuery("#surePop").click(function(){
            var inputPwdStr = jQuery("#g_input_pwd").val();
            if (inputPwdStr === ""){
                alert("请输入密码！");
                return;
            }
            g_input_pwd = inputPwdStr;
            item.device.pwd = inputPwdStr;
            item.init();
            jQuery("#popView").remove();
            jQuery("#popViewBackground").remove();
        });
    }

    // 密码错误执行
    function inputPwd(index) {
        // console.log("shishi",index,errArray,errItemObj);
        for (var i = 0;i < errItemObj.length;i++){
            if (errItemObj[i].index === index){
                popPwdInput(errItemObj[i]);
            }
        }
    }
    function setLocalCssMark(index) {
        jQuery(".device_list_li").css({border: "none"});
        localStorage.setItem("clickCellIndex",index);
        var clickCellIndex = localStorage.getItem("clickCellIndex");
        jQuery(".device_list_li").eq(clickCellIndex).css({border: "2px solid red"});
    }


    //键盘操作
    jQuery(document).keydown(function (event) {
        var currentIndex = localStorage.getItem("clickCellIndex");
        console.log("currentIndex=",currentIndex,event.keyCode);
        currentIndex = parseInt(currentIndex);
        if (event.keyCode == 82 && event.ctrlKey) {
            location.reload();
            // jQuery("#refresh_device").click();
        }
        switch (event.keyCode) {
            case 13:
                if (jQuery("#test_button").html() === "停止测试"){
                    alert("先停止测试");
                    return;
                }

                if (jQuery("#popView").css("display") === "block"){
                    jQuery("#surePop").click();
                    return;
                }
                var currentDom = jQuery(".cell").eq(currentIndex).data("index");
                cellClick(g_play_cell[currentDom]);

                break;
            case 27:
                if (jQuery("#test_button").html() === "停止测试") {
                    alert("先停止测试");
                    return;
                }
                click_back();
                if (jQuery("#popView").css("display") === "block"){
                    if (jQuery("#popView") || jQuery("#popViewBackground")){
                        jQuery("#popView").remove();
                        jQuery("#popViewBackground").remove();
                    }
                }
                break;
            case 97:
            case 89:
            case 66:
                // 弹出框YES
                jQuery("#standard_buttons_green").click();
                break;
            case 78:
            case 98:
                // 弹出框NO
                jQuery("#standard_buttons_red").click();
                break;
            case 37:
                currentIndex -- ;
                if (currentIndex < 0) return;
                setLocalCssMark(currentIndex);
                break;
            case 38:
                currentIndex = currentIndex - 3;
                if (currentIndex < 0) return;
                // current = current - 500;
                // console.log(jQuery("#page_left").scrollTop());
                // jQuery("#page_left").scrollTop(current);
                setLocalCssMark(currentIndex);
                break;
            case 39:
                currentIndex ++;
                if (currentIndex >= g_all_data.length) return;
                setLocalCssMark(currentIndex);
                break;
            case 40:
                currentIndex = currentIndex + 3;
                if (currentIndex >= g_all_data.length) return;
                // current = current + 500;
                setLocalCssMark(currentIndex);
                // jQuery("#page_left").scrollTop(current);
                break;
            case 46:
            case 110:
                jQuery(".device_list_li").eq(currentIndex).remove();
                setLocalCssMark(currentIndex);
                break;
        };
    });


    function create_search_dev_frame(requestIP,index) {
        // var refresh_dev_frame=dom_create_child(g_main_page_div, "iframe", "refresh_dev_frame" + index);
        // refresh_dev_frame.style.display="none";
        // var doc = refresh_dev_frame.contentDocument || refresh_dev_frame.contentWindow.document;
        // var temp_script = doc.createElement("script");
        // temp_script.type = "text/javascript";
        // temp_script.src = "http://"+requestIP+"/ccm/CcmGetDeviceRequest.js?hfrom_handle="+ new Date().getTime();
        // var head = doc.getElementsByTagName("head")[0];
        // refresh_dev_frame.contentWindow.message = function(msg){
        //     jQuery("#refresh_dev_frame" + index).remove();
        //     console.log(msg,"==");
        //     if(!dev_get(msg.data.SerialNumber)) {
        //         g_all_data[index]={name:msg.data.SerialNumber,version:msg.data.Version?msg.data.Version:"v1",ip:requestIP,pwd:g_dev_default_pass,spv:msg.data.spv};
        //         jQuery("#dev_os_version" + index).html(msg.data.Version?msg.data.Version:"v1");
        //     }
        // };
        new getDevInfo(requestIP,index);
    }
    function getDevInfo(requestIP,index) {
        this.refresh_dev_frame = dom_create_child(g_main_page_div, "iframe", "refresh_dev_frame");
        this.refresh_dev_frame.style.display="none";
        this.doc = this.refresh_dev_frame.contentDocument || this.refresh_dev_frame.contentWindow.document;
        this.temp_script = this.doc.createElement("script");
        this.temp_script.type = "text/javascript";
        this.temp_script.src = "http://"+requestIP+"/ccm/CcmGetDeviceRequest.js?hfrom_handle="+ new Date().getTime();
        this.head = this.doc.getElementsByTagName("head")[0];
        this.head.insertBefore(this.temp_script, this.head.firstChild);
        var self = this;
        this.refresh_dev_frame.contentWindow.message=function(msg){
            jQuery(self.refresh_dev_frame).remove();
            if(!dev_get(msg.data.SerialNumber)) {
                g_all_data[index]={name:msg.data.SerialNumber,version:msg.data.Version?msg.data.Version:"v1",ip:requestIP,pwd:g_dev_default_pass,spv:msg.data.spv};
                jQuery("#dev_os_version" + index).html(msg.data.Version?msg.data.Version:"v1");
            }
        };

    }

    function create_dev_list(dev_sn,dev_ip,dev_ver) {
        var li= document.createElement("li");
        li.innerHTML=dev_sn;
        li.title="IP："+dev_ip+"\nVersion："+dev_ver;
        li.style.cursor="pointer";
        li.id="device_list_li_"+g_devsNum;
        li.onclick=function(){
            var intEnd=li.innerHTML.indexOf("<");
            var sn=(intEnd>0)?li.innerHTML.substr(0, intEnd):li.innerHTML;
            for(var i=0;i<g_devsNum;i++)
            {
                document.getElementsByTagName("li")[i].style.color="#fff";
            }
            click_init();
            g_selectedDevice=dev_get(sn);
            if(g_selectedDevice)
            {
                li.style.color="#A8FF24";
                g_mcloud_agent.set_srv(g_selectedDevice.ip);
                g_mcloud_account.set_srv(g_selectedDevice.ip);
                set_fix();
                if(!$$("connect_dev_tip"))connect_dev_tip({parent:li,type:1});
                g_mcloud_agent.sign_in({srv : g_selectedDevice.ip,user : g_selectedDevice.name,password : mmd5.hex(g_default_pass_input.value)}, null,
                    function(msg, ref) {
                        connect_dev_tip({parent:li,type:0});
                        if(!$$("system_tooltip"))system_tooltip({parent:li,type:msg.result});
                    });
            }
        };
        g_device_list_ul.appendChild(li);
    }

    function connect_dev_tip(obj) {
        var  p = obj.parent,connect_dev_tip,dom_tip_content,dom_tip_arrow,index;
        index=p.id.substr(15,16);
        if(obj.type)
        {
            connect_dev_tip = dom_create_child(g_device_list_ul, "div", "connect_dev_tip");
            dom_tip_content = dom_create_child(connect_dev_tip, "div", "system_tooltip_content");
            dom_tip_arrow = dom_create_child(connect_dev_tip, "span", "system_tooltip_arrow");
            connect_dev_tip.style.cssText = "display: block;position: absolute;z-index: 50;";
            dom_tip_content.style.cssText = "position: absolute;width: 120px;border-radius: 4px;font-size: 14px;font-weight: 700;text-align: center;z-index: 50;border-left: 1px solid #9CEC60;border-top: 1px solid #9CEC60;color: #fff;background: #CAC81C;border: 0;";
            dom_tip_arrow.style.cssText = "position: absolute;top:4px;border-style: solid;border-width: 4px;display: block;height: 1px;overflow: hidden;width: 1px;z-index: 30;border-color:transparent #CAC81C transparent transparent;";
            dom_tip_content.innerHTML = "正在连接设备...";
            connect_dev_tip.style.top = p.offsetHeight + "px";
            connect_dev_tip.style.left = p.offsetWidth+12+"px";
            dom_tip_arrow.style.top = index*30+"px";
            dom_tip_content.style.top = (index*30)-9+"px";
            dom_tip_arrow.style.left = "0px";
            dom_tip_content.style.left = dom_tip_arrow.offsetWidth + "px";
        } else {
            connect_dev_tip=$$("connect_dev_tip");
            if(!connect_dev_tip)return;
            connect_dev_tip.innerHTML = "";
            connect_dev_tip.parentNode.removeChild(connect_dev_tip);
            connect_dev_tip = null;
            return ;
        }
    }

	function system_tooltip(obj) {
        var  p = obj.parent,dom_tooltip_div,dom_tooltip_content,dom_tooltip_arrow,index;
        dom_tooltip_div = dom_create_child(g_device_list_ul, "div", "system_tooltip");
        index=p.id.substr(15,p.length);
        function destroy_system_tooltip() {
            dom_tooltip_div=$$("system_tooltip");
            if(!dom_tooltip_div)return;
            dom_tooltip_div.innerHTML = "";
            dom_tooltip_div.parentNode.removeChild(dom_tooltip_div);
            dom_tooltip_div = null;
            return ;
        }
        // if(obj.type) {
        //     set_button_disable(true);
        //     dom_tooltip_div.style.cssText = "cursor: auto;font-size:16px;position: absolute;height:120px;width:160px;line-height:250%;color:#fff;z-index: 50;border-left: 5px solid #9E9B9B;border-right: 5px solid #9E9B9B;background-color: rgb(71, 68, 68);border-radius: 10px;";
        //     dom_tooltip_div.title="";
        //     dom_tooltip_div.style.top = (parseInt(index)+2)*30-10 + "px";
        //     dom_tooltip_title = dom_create_child(dom_tooltip_div, "div", "system_tooltip_title");
        //     dom_tooltip_input = dom_create_child(dom_tooltip_div, "input", "system_tooltip_input");
        //     dom_tooltip_button = dom_create_child(dom_tooltip_div, "button", "system_tooltip_button");
        //     dom_tooltip_title.textContent="请重新输入密码：";
        //     dom_tooltip_input.style.cssText ="font-size:16px;border-radius:0px;height:30px;width:100%";
        //     dom_tooltip_input.placeholder="密码";
        //     dom_tooltip_input.type="text";
        //     dom_tooltip_input.focus();
        //     dom_tooltip_button.textContent="确定";
        //     dom_tooltip_button.style.cssText="position: absolute;right:10px;bottom:10px;width:60px;height:25px;background-color:#00BB00;font-weight: bold;color: #EAEAEA;cursor: pointer;border: 0px;border-radius: 5px;";
        //     // dom_tooltip_button.onclick=relogin;
        //     dom_tooltip_input.onkeyup=function(event){
        //         if(event.keyCode==13) {
        //             g_mcloud_agent.sign_in({srv : g_selectedDevice.ip,user : g_selectedDevice.name,password : dom_tooltip_input.value}, null,
        //             function(msg, ref) {
        //                 if(msg.result){
        //                     dom_tooltip_span = dom_create_child(dom_tooltip_div, "span", "system_tooltip_span");
        //                     dom_tooltip_span.textContent="密码错误";
        //                     dom_tooltip_span.style.cssText="position: absolute;left:12px;bottom:8px;color:red;font-size:12px";
        //                     setTimeout(function(){
        //                         if($$("system_tooltip_span"))
        //                         {
        //                             $$("system_tooltip_span").innerHTML = "";
        //                             $$("system_tooltip_span").parentNode.removeChild($$("system_tooltip_span"));
        //                         }
        //                     },1000);
        //                 }
        //                 else{
        //                     destroy_system_tooltip();
        //                     system_tooltip({parent:p,type:msg.result});
        //                 }
        //             });
        //         }
        //     }
        //
        //     dom_tooltip_button.onclick=function(){
        //         g_mcloud_agent.sign_in({srv : g_selectedDevice.ip,user : g_selectedDevice.name,password : mmd5.hex(dom_tooltip_input.value)}, null,
        //             function(msg, ref) {
        //                 if(msg.result){
        //                     dom_tooltip_span = dom_create_child(dom_tooltip_div, "span", "system_tooltip_span");
        //                     dom_tooltip_span.textContent="密码错误";
        //                     dom_tooltip_span.style.cssText="position: absolute;left:12px;bottom:8px;color:red;font-size:12px";
        //                     setTimeout(function(){
        //                         if($$("system_tooltip_span"))
        //                         {
        //                             $$("system_tooltip_span").innerHTML = "";
        //                             $$("system_tooltip_span").parentNode.removeChild($$("system_tooltip_span"));
        //                         }
        //                     },1000);
        //                 } else{
        //                     destroy_system_tooltip();
        //                     system_tooltip({parent:p,type:msg.result});
        //                 }
        //             });
        //     }
        // } else

        if (obj.type === ""){
            set_button_disable(false);
            test("play");
            g_mcloud_agent.net_get({sn:g_selectedDevice.name},null,function(msg,ref){
                if(msg.result==""){
                    var now_ethernet_ifs = msg.networks[0];
                    var now_wifi_ifs = msg.networks[1];
                    if(now_ethernet_ifs.ipv4&&now_ethernet_ifs.ipv4.conf&&now_ethernet_ifs.ipv4.info)
                    {
                        $$("dev_site_ethernet").href="http://"+now_ethernet_ifs.ipv4.info.ip.addr;
                        $$("dev_site_ethernet").textContent="以太网："+now_ethernet_ifs.ipv4.info.ip.addr;
                    }
                    if(now_wifi_ifs.ipv4&&now_wifi_ifs.ipv4.conf&&now_wifi_ifs.ipv4.info)
                    {
                        if(now_wifi_ifs.ipv4.info.status == "ok"||now_wifi_ifs.ipv4.info.stat == "ok")
                        {
                            $$("dev_site_wifi").href="http://"+now_wifi_ifs.ipv4.info.ip.addr;
                            $$("dev_site_wifi").textContent="WiFi："+now_wifi_ifs.ipv4.info.ip.addr;
                        }
                    }
                }
            });

            if(g_selectedDevice.name.substr(0, 3) != "166") {
                g_mcloud_account.set_srv(g_selectedDevice.ip);
                g_mcloud_agent.set_srv(g_selectedDevice.ip);
                var upgrade_get_timeout_id = setTimeout(function(){
                    g_version_info_span.textContent="无法连接到服务器";
                    g_upgrade_button.disabled=true;
                    g_upgrade_button.style.cursor="auto";
                },5000);
                g_mcloud_agent.upgrade_get({sn:g_selectedDevice.name,check:1},null,function(msg,ref){
                    if(msg.result) {
                        g_version_info_span.textContent="无法连接到服务器";
                        g_upgrade_button.disabled=true;
                        g_upgrade_button.style.cursor="auto";
                    } else {
                        g_valid_version=msg.ver_valid;
                        g_os_version_span.textContent = "| 内核版本: "+(msg.os_ver?msg.os_ver:"--")+" |";
                        if(g_selectedDevice.version==g_valid_version)
                        {
                            g_version_info_span.textContent="当前版本:"+msg.ver_current+"|已是最新版本";
                            g_upgrade_button.disabled=true;
                            g_upgrade_button.style.cursor="auto";
                        } else {
                            g_version_info_span.textContent="当前版本:"+msg.ver_current+"|有新的版本 "+g_valid_version;
                            g_upgrade_button.disabled=false;
                            g_upgrade_button.style.cursor="pointer";
                            var orign_color;
                            g_upgrade_button.onmouseover=function(){orign_color=event.srcElement.style.backgroundColor;event.srcElement.style.backgroundColor="#73BF00";};
                            g_upgrade_button.onmouseout=function(){event.srcElement.style.backgroundColor=orign_color};
                            g_dev_upgrade_div.style.display = "inline-block";
                        }
                    }
                    clearTimeout(upgrade_get_timeout_id);
                });
                g_mcloud_agent.dev_info_get({sn:g_selectedDevice.name},null,function(msg,ref){
                		if(msg.result)
                		{
                			  g_version_sensor_wifi.textContent="无法连接到服务器";
                			  g_upgrade_button.disabled=true;
                			  g_upgrade_button.style.cursor="auto";
                		} else {
                            $$("lang_select").innerHTML = "<option value='' disabled='true' selected='true'>选择语言</option><option value='zh'>中文</option><option value='en'>英文</option>";
                            $$("lang_select_div").style.display = "inline-block";
                            g_devs_ver = msg.ver;
                            var rffreq = msg.rffreq?"|外设型号:"+msg.rffreq:"";
                            var rf_ver = msg.exver?"|外设版本号:"+exver:"";
                			  g_version_sensor_wifi.textContent="WIFI型号:"+(msg.wifi?msg.wifi:"--")+" |"+"Sensor型号:"+(msg.sensor?msg.sensor:"--")+" |"+"主控型号:"+(msg.os?msg.os:"--")+rffreq+rf_ver+" |"+"上线时间:"+(msg.uptime?(msg.uptime+"s"):"--")+" |";
                		}
                });
            }
            g_dev_upgrade_div.style.display = "inline-block";
            g_restore_div.style.display = "inline-block";
            g_dev_site_div.style.display = "inline-block";
            if(g_selectedDevice.name.substr(0, 3) == "166")
                    g_activation_div.style.display = "block";
            dom_tooltip_content = dom_create_child(dom_tooltip_div, "div", "system_tooltip_content");
            dom_tooltip_arrow = dom_create_child(dom_tooltip_div, "span", "system_tooltip_arrow");
            dom_tooltip_div.style.cssText = "display: block;position: absolute;z-index: 50;";
            dom_tooltip_content.style.cssText = "position: absolute;width: 70px;border-radius: 4px;font-size: 14px;font-weight: 700;text-align: center;z-index: 100;border-left: 1px solid #9CEC60;border-top: 1px solid #9CEC60;color: #fff;background: #55b137;border: 0;";
            dom_tooltip_arrow.style.cssText = "position: absolute;top:4px;border-style: solid;border-width: 4px;display: block;height: 1px;overflow: hidden;width: 1px;z-index: 30;border-color:transparent #6dc33f transparent transparent;";
            dom_tooltip_content.innerHTML = "连接成功";
            dom_tooltip_div.style.top = p.offsetHeight + "px";
            dom_tooltip_div.style.left = p.offsetWidth+12+"px";
            dom_tooltip_arrow.style.top = index*30+"px";
            dom_tooltip_content.style.top = (index*30)-9+"px";
            dom_tooltip_arrow.style.left = "0px";
            dom_tooltip_content.style.left = dom_tooltip_arrow.offsetWidth + "px";
        }

        var divx1 = dom_tooltip_div.offsetLeft;
        var divy1 = dom_tooltip_div.offsetTop;
        var divx2 = dom_tooltip_div.offsetLeft + dom_tooltip_div.offsetWidth;
        var divy2 = dom_tooltip_div.offsetTop + dom_tooltip_div.offsetHeight;
        document.onclick=function() {
             var page_top_height=$$("page_top").offsetHeight;
             var x=event.clientX;
             var y=event.clientY>page_top_height?(event.clientY-page_top_height):event.clientY;
             if( x < divx1 || x > divx2 || y < divy1 || y > divy2){
                 destroy_system_tooltip();
             }
        };
    }

    function set_preview() {
        var url;
        url=(g_selectedDevice.version.substr(0,2)<"v2")?("http://" +g_mcloud_account.get_srv()+ "/ccm/CcmGetImageRequest.jpg?hfrom_handle=887330&dSession=1&dSession_Nid="+g_mcloud_agent.create_nid()+"&dSession_SerialNumber="+g_selectedDevice.name+"&dtoken=p0_xxxxxxxxxx"):
            (url="http://" +mcloud_account.get_srv()+ "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid="+g_mcloud_agent.create_nid()+"&dsess_sn="+g_selectedDevice.name+"&dtoken=p0_xxxxxxxxxx");
       $$("view_page").style.background="url("+url+")";
       $$("view_page").style.backgroundSize="100% 100%";
    }

	function create_mme(obj) {
        var panel, server_device,mme_params,
            ua = navigator.userAgent.toLowerCase(),
            url_params = (location.search || location.hash || "");
            panel = obj.dom;
            panel.style.width = obj.dom.offsetWidth + "px";
            panel.style.height = obj.dom.offsetHeight + "px";
            server_device=location.host;
        if(server_device=="96.46.4.26") {
            mme.prototype.types.install.codebase=navigator.platform == "MacIntel"?"http://us.mipcm.com/mme/npmme.pkg?0.140523.pkg":"http://us.mipcm.com/mme/mme.exe?0.140523.exe";
        } else {
            mme.prototype.types.install.codebase=navigator.platform == "MacIntel"?"http://dl.mipcm.com:7080/mme/npmme.pkg?0.140523.pkg":"http://dl.mipcm.com:7080/mme/mme.exe?0.140523.exe";
        }
        mme.prototype.types.flash.install_url="mme/mme.swf?0.130715.swf";
        mme_params = {parent:panel, params:"{key:'data:application/octet-stream;base64,NGO/Mnqt7aXYO3hdsIe87bCTuqTRRSPMwJGuT26CuSedGTi2h7wroHY0IZObBPKYA/exp+e/efFj35sLiDKQpRfRFz8Th8zlYtrYki24JiN7vpGb2bUN9nY7quZ56SicUoqLd+KcCrvWheZ5NaE+slPpCg+F+hUdhNl4JXbVxzx5U6jS92D/SBoDfpMTvF8n3ELgtVFOm3VG+22f97jzrRT22WqSzmmwsM5CNX3cwVfeM5vSPVzeo/kw0ERT9k1mdqG1lScyhMuYsgrWZ0zQSKUni7AUUoiO8qqSfW28XR6CJgp5/JiLHa0kAQtVCVxm886cpuLLUn2SJCHQwS985Fd6PH49IhI+ZgKK5NA+LX+qV3tHHkGdt0C+4n7AMOxHGB+iqepOiK13Bm3YkX7BB9uR80IAltc5YVA0CWg/jog8cCETr1pWm8XngSP4pJa4ZwJq5VuPcBKDTYzqXPJsnIDpZ7L+oz457Ysz+Cc7N7keTCXuI3aFPOjxvdAdCQqKb0Hra3LuxCr5FCfZxx/mn1rddD24Ol74WXtfRJqDs8K/zYpWMnuLU7NjTNdJGMjDs2zYpq56Vd2gq0sS+yyHyhvU4lcIxT05+YfiDMSznuF4BQuKyK7yxa0X73GjUNZFxV3lqIkGKWXjMf4rv4RyE2j1mEqgqGuAW+s2PZ35xOE'}",
            on_event:function(e){on_plug_event(e)},
            ref_obj:obj,
            debug:(0 <= url_params.indexOf("debug=1"))};
        if(ua.match(/windows|win32/))
        {
            if(0 <= url_params.indexOf("windowless=0"))
            {
                mme_params.windowless = false;
            }
            else if(0 <= url_params.indexOf("windowless=1"))
            {
                mme_params.windowless = true;
            }
        }
        obj.inner_window_info.mme = new mme(mme_params);
        g_playing_mme=obj.inner_window_info.mme;
    }

    function on_plug_event(obj) {
        if(obj.type == "install_ui")
        {
            var j_panel = $$(obj.panel);
            j_panel.fadeOut();
            obj.panel.style.cssText = "cursor:default;position:relative;left:0px;top:0px;width:100%;height:100%;color:#fff;visibility:hidden;background-image:url('../imgs/media_install_bg.png')";
            j_panel.hide();
            j_panel.fadeIn();
        }
        else if(obj.type == "ready")
        {
            var proto = obj.ref_obj.protocol;
            if(obj.plug.type.name == "flash")
            {
                plug_type = "flash";
                proto = "rtmp";
            }
            else if(proto == "auto"){
                    proto = "rtdp";
            }
            if(obj.ref_obj.page == "home")
            {
                g_mcloud_agent.play({sn:g_selectedDevice.name,protocol:proto,token:"p0"},obj.ref_obj, function(msg,ref) {
                    msg.result?system_pop_confirm_box({alert:true,index:1,str:"play error: "+msg.result}):chl_video_create({type:"play",url:msg.url, params:"", inner_window_info:ref.inner_window_info});
                    function re_net_get(){
                        g_mcloud_agent.set_srv(g_selectedDevice.ip);
                        g_mcloud_agent.net_get({sn:g_selectedDevice.name},null,re_net_get);
                    }
                    // re_net_get();
                    test_next();
                });
            }

        }
    }

    function chl_video_create(obj) {
        var url = obj.url, chl_params = (obj.type == "publish")?"":",thread:\"istream\", jitter:{max:3000}"/* for old version's mme plugin */,
            trans_params = (obj.type == "play")?",trans:[{flow_ctrl:\"jitter\",thread:\"istream\"}]":
                ((obj.type == "playback")?",trans:[{flow_ctrl:\"delay\",thread:\"istream\"}]":"");
        obj.inner_window_info.video_chls = obj.inner_window_info.mme.chl_create({
            params:("{" + ((obj.type == "publish")?"dst":"src") + ":[{url:\"" + url + "\"}]" + trans_params + chl_params + "}")});
    }

    function video_destroy()
    {
        if(g_inner_window_info.mme)
        {
            g_play_flag=0;
            g_inner_window_info.mme.destroy();
            g_play_button.textContent="预览";
            // var video_obj=document.getElementsByTagName("object");
            // if(video_obj[0])g_view_page.removeChild(video_obj[0]);
            g_view_page.innerHTML = "";
        }
    }

    function chl_audio_create(obj)
    {
        var url = obj.url, chl_params = "";
        obj.inner_window_info.audio_chls = obj.inner_window_info.mme.chl_create({
            params:("{src:[{url:'mic://0',type:'audio'}], dst:[{url:'" + url + "'}]" + (("" != chl_params)?",":"") + chl_params + "}")});
    }

    function record()
	{
	    var keep_time,hour =minute=second=t = 0;
	    keep_time=(g_record_button.textContent=="录像")?60000:-1;
	    g_mcloud_agent.record({sn:g_selectedDevice.name,keep_time:keep_time},null,
	        function(msg,ref){
	            if(msg.result!=""){
	                system_pop_confirm_box({alert:true,index:1,str:"record error: "+msg.result});
	            }
	            else if(msg.sd_ready==0){
	                system_pop_confirm_box({alert:true,index:1,str:"record error: SD卡未准备好"});
	            }
                else{(keep_time==60000)?recordTime():stopTime();}
	            });
        function recordTime()
        {
            hour=parseInt(t/60/60);
            minute=parseInt(t/60%60);
            second=parseInt(t%60);
            g_record_button.textContent=hour+":"+minute+":"+second;
            t = t + 1;
            g_record_flag = setTimeout(function(){recordTime()}, 1000);
        }
        function stopTime()
        {
            clearTimeout(g_record_flag);
            g_record_button.textContent="录像";
        }
	}

	function create_snapshot_view (parent_dom,url) {
	    var snapshot_preview_div=$$("snapshot_preview_div"),
            snapshot_preview_inner=$$("snapshot_preview_inner"),
            snapshot_preview_content=$$("snapshot_preview_content"),
            snapshot_preview_close=$$("snapshot_preview_close");
        if(snapshot_preview_content){
            snapshot_preview_content.src = url;
        }
        else
        {
            snapshot_preview_div=dom_create_child(parent_dom,"div","snapshot_preview_div");
            snapshot_preview_div.style.cssText = "width:50%;height:55%;left:22%;top:18%;position:absolute;z-index:50";
            snapshot_preview_inner=dom_create_child(snapshot_preview_div,"div","snapshot_preview_inner");
            snapshot_preview_inner.style.cssText = "width:98%;height:98%px;margin:6px;position:relative;border-radius: 10px;background-color: #F4F4F4;";
            snapshot_preview_content=dom_create_child(snapshot_preview_inner,"img","snapshot_preview_content");
            snapshot_preview_content.style.cssText = "width:98%;height:98%;margin:7px;position:relative;";
            snapshot_preview_content.src = url;
            snapshot_preview_close=dom_create_child(snapshot_preview_div,"div","snapshot_preview_close");
            snapshot_preview_close.style.cssText = "position:absolute;right:9px;top:6px;cursor:pointer;font-size: 20px;background: #F0F0F0;border-top-right-radius:20px;border-bottom-left-radius:20px";
            snapshot_preview_close.innerHTML = "×";
            snapshot_preview_close.onclick = function() {
                snapshot_preview_div.innerHTML= "";
                parent_dom.removeChild(snapshot_preview_div);
                snapshot_preview_div = null;
                snapshot_preview_close.onclick = "";
                snapshot_preview_close.onmouseover = "";
                snapshot_preview_close.onmouseout = "";
            };
            snapshot_preview_close.onmouseover = function() {
                snapshot_preview_close.style.color="red";
            };
            snapshot_preview_close.onmouseout = function() {
                snapshot_preview_close.style.color="black";
            };
        }
	}

	function talk () {
	   if(g_talk_button.textContent=="对讲")
	   {
	        g_mcloud_agent.pushtalk({sn:g_selectedDevice.name,protocol:"rtdp",token:"p1"},null,function(msg,ref){
                if(msg.result==""){
                    g_talk_button.textContent="对讲..";
                    chl_audio_create({type:"publish",url:msg.url, params:"", inner_window_info:g_playing_mme.ref_obj.inner_window_info});
                }else{system_pop_confirm_box({alert:true,index:1,str:"talk error: "+msg.result});}
                test_next();
            });
	   }
	   else{
	       g_playing_mme.chl_destroy(g_playing_mme.ref_obj.inner_window_info.audio_chls);
           g_playing_mme.ref_obj.inner_window_info.audio_chls = null;
           g_talk_button.textContent="对讲";
	   }
	}

	function get_sd_info()
	{
		g_mcloud_agent.sd_get({sn:g_selectedDevice.name},null,function(msg,ref){
            if(msg.result==""){
                if(msg.capacity>0)
                {
                    add_test_li("sd_info",1);
                    $$("sd_info_span").textContent ="  "+msg.capacity+"MB";
                }
                else
                {
                    add_test_li("sd_info",2);
                }
            }else{system_pop_confirm_box({alert:true,index:1,str:"get_sd_info error: "+msg.result});}
            test_next();
    });

	}
	function set_mode(obj)
	{
	    var set_mode_div=$$("set_mode_div");
	    if(obj.flag)
	    {
	        var content_div=$$("set_mode_content_div"),
             triangle_span=$$("set_mode_triangle_span"),
             left_num=$$("set_mode_button").offsetLeft+$$("set_mode_button").offsetWidth/2-11;
             content_div.style.left=left_num-23+"px";
             content_div.style.bottom=-5+"px";
             triangle_span.style.left=left_num+"px";
             set_mode_div.style.display="block";
             g_set_mode_flag=0;
	    }
	    else
	    {
	        set_mode_div.style.display="none";
            g_set_mode_flag=1;
	    }
	    if(obj.type&&obj.type!="set_mode")
	    {
            g_mcloud_agent.cam_get({sn:g_selectedDevice.name},null,function(msg,ref){
                if(msg.result!=""){
                    system_pop_confirm_box({alert:true,index:1,str:"get_mode error: "+msg.result});
                    test_next();
                }
                else{
                    g_mcloud_agent.cam_set({sn:g_selectedDevice.name,brightness:msg.brightness,contrast:msg.contrast,color_saturation:msg.color_saturation,sharpness:msg.sharpness,day_night:obj.type,flip:msg.flip,flicker_freq:msg.flicker_freq},null,function(msg,ref){
                        if(msg.result!=""){system_pop_confirm_box({alert:true,index:1,str:"set_mode error: "+msg.result});}
                        test_next();
                    });
                }

            });
            set_mode_div.style.display="none";
            g_set_mode_flag=1;
	    }
	}
	function get_wifi_list(type)
    {
        var wifi_list_div=$$("wifi_list_div");
        if(type) {
            g_mcloud_agent.net_get({sn:g_selectedDevice.name},null,function(msg,ref){
                if(msg.result==""){
                    var wifi_list_content_ul=$$("wifi_list_content_ul"),
                    content_div=$$("wifi_list_content_div"),
                    triangle_span=$$("wifi_list_triangle_span"),
                    left_num=$$("wifi_list_button").offsetLeft+$$("wifi_list_button").offsetWidth/2-100;
                    var now_ifs = msg.networks[1];
                    if(now_ifs.wifi_client && now_ifs.wifi_client.conf && now_ifs.wifi_client.info) {
                        if(now_ifs.wifi_client.ap_list) {
                            var i, length, signal_level = 0, inner_html = "";
                            length = now_ifs.wifi_client.ap_list.length;
                            if(length>0){
                                wifi_list_content_ul.innerHTML="";
                                for(i = 0; i < length; ++i) {
                                    if(now_ifs.wifi_client.ap_list[i].ssid.substring(0,3)!="ipc") {
                                        if(now_ifs.wifi_client.ap_list[i].quality >= 0 && now_ifs.wifi_client.ap_list[i].quality <= 100) {
                                            signal_level = Math.floor(now_ifs.wifi_client.ap_list[i].quality / 20);
                                            signal_level = (signal_level >= 5 ? 4 :signal_level);
                                        }
                                        var li= document.createElement("li");
                                        li.style.cssText="margin: 2px;";
                                        li.style.cursor="pointer";
                                        li.innerHTML="<span >"+now_ifs.wifi_client.ap_list[i].ssid+"</span><div style='float:right;margin-right:20px;'>"+now_ifs.wifi_client.ap_list[i].quality+"/"+now_ifs.wifi_client.ap_list[i].signal+"</div><img src='"+"imgs/wifi_signal"+signal_level+".png'"+" style='position: absolute;right: 2px;width: 20px;' />";
                                        li.onclick=function(e){
                                            g_wifi_ssid_input.value=e.currentTarget.getElementsByTagName("span")[0].textContent;
                                        };
                                        wifi_list_content_ul.appendChild(li);
                                    }
                                }
                            } else {
                                wifi_list_content_ul.innerHTML="未搜索到wifi";
                            }
                        } else if(now_ifs.phy.info.status == "err"||now_ifs.phy.info.stat == "err") {
                            wifi_list_content_ul.innerHTML="连接故障";
                            //stop_test();
                            g_wifi_connect_flag=-1;
                            g_test_array_index++;
                            $$("wifi_list_span").textContent="  ×";
                            $$("wifi_connect_span").textContent="  ×";
                            $$("wifi_connect_span").style.color="#ff0000";
                            if(g_test_array_names[g_test_array_names.length-1]=="wifi_connect")
                            {
                                g_auto_test_flag=0;
                                g_test_button.textContent="开始测试";
                            }
                        } else {
                            wifi_list_content_ul.innerHTML="未搜索到wifi";
                        }
                     }
                    content_div.style.left=left_num+"px";
                    content_div.style.bottom=-5+"px";
                    triangle_span.style.left=left_num+90+"px";
                    wifi_list_div.style.display="block";
                    var view_page_height=$$("view_page").clientHeight;
                    content_div.style.height=wifi_list_content_ul.offsetHeight<view_page_height?(wifi_list_content_ul.offsetHeight+20+"px"):(view_page_height+"px");
                    g_wifi_list_flag=0;
                }else{system_pop_confirm_box({alert:true,index:1,str:"get_wifi_list error: "+msg.result});}
                test_next();
            });
        } else {
            wifi_list_div.style.display="none";
            wifi_list_content_ul.innerHTML="";
            g_wifi_list_flag=1;
        }
    }

    function set_wifi_connect()
    {
        test_next();
        if(g_wifi_connect_button.textContent=="连接中..")
        {
            g_wifi_connect_button.textContent="WiFi连接";
            g_wifi_connect_flag=-1;
        }
        if(g_wifi_connect_flag==-1) return;
        g_wifi_connect_flag=1;
        if(g_wifi_ssid_input.value&&g_wifi_pass_input.value)
        {
            var now_net_info=[],wifi_connect_times=0;
            g_wifi_connect_button.textContent="连接中..";
            $$("wifi_connect_span").textContent=" ：进行中..";
            $$("wifi_connect_span").style.color="#ffffff";
            set_storage_data({str:"wifi_info", data:{ssid:g_wifi_ssid_input.value,pass:g_wifi_pass_input.value}});
            now_net_info["ifs"] = {token:"ra0", enabled:1};
             now_net_info["dns"]= {conf:{enalbed: 0,mode: "dhcp",static_dns:{0: "0.0.0.0"}}};
            now_net_info.ifs["phy"] = {conf:{mode:"wificlient",mtu: 0}};
             now_net_info.ifs["ipv4"] = {conf:{debug_ip: "",enabled: 1,mode: "dhcp",static_ip: ""}};
            now_net_info.ifs["wifi_client"] ={conf:{enabled:1,ssid:g_wifi_ssid_input.value,key:g_wifi_pass_input.value,usr:g_wifi_ssid_input.value}};
            g_mcloud_agent.net_set({sn:g_selectedDevice.name,networks:now_net_info.ifs,dns:now_net_info.dns},null,function(msg,ref){
                //test_next();
                if(msg.result==""){
                    get_network_info_request();
                }
                else
                {
                    add_test_li("wifi_connect",2);
                    g_wifi_connect_button.textContent="WiFi连接";
                    system_pop_confirm_box({alert:true,index:1,str:"set_wifi_connect error: "+msg.result});
                }
            });
            function get_network_info_request()
            {
                var get_network_timeout_id;
                g_mcloud_agent.net_get({sn:g_selectedDevice.name},null,function(msg,ref){
                    if(msg.result==""){
                        var now_ifs = msg.networks[1];
                        wifi_connect_times++;
                        if((now_ifs.ipv4.info.status == "ok"||now_ifs.ipv4.info.stat == "ok")&& wifi_connect_times>3)
                        {
                            add_test_li("wifi_connect",1);
                            $$("dev_site_wifi").href="http://"+now_ifs.ipv4.info.ip.addr;
                            $$("dev_site_wifi").textContent="WiFi："+now_ifs.ipv4.info.ip.addr;
                            g_wifi_connect_button.textContent="WiFi连接";
                            if(g_test_array_names[g_test_array_names.length-1]=="wifi_connect")
                            {
                                g_auto_test_flag=0;
                                g_test_button.textContent="开始测试";
                            }
                        }
                        else if(wifi_connect_times<18)
                        {
                            if(g_wifi_connect_flag)
                            {
                                get_network_timeout_id=setTimeout(function(){
                                    get_network_info_request();
                                },4000);
                            }
                            else
                            {
                                $$("wifi_connect_span").textContent=" ：取消";
                                $$("wifi_connect_span").style.color="#ffffff";
                                g_wifi_connect_button.textContent="WiFi连接";
                                clearTimeout(get_network_timeout_id);
                            }
                        }
                        else
                        {
                            clearTimeout(get_network_timeout_id);
                            add_test_li("wifi_connect",2);
                            g_wifi_connect_button.textContent="WiFi连接";
                            if(g_test_array_names[g_test_array_names.length-1]=="wifi_connect")
                            {
                                g_auto_test_flag=0;
                                g_test_button.textContent="开始测试";
                            }
                            return;
                        }
                    }
                    else
                    {
                        system_pop_confirm_box({alert:true,index:1,str:"get_wifi_list error: "+msg.result});
                        g_wifi_connect_button.textContent="WiFi连接";
                    }
                });
            }
        }
        else
        {
            system_pop_confirm_box({alert:true,index:1,str:"wifi ssid或密码为空"});
            // stop_test();
            $$("wifi_connect_span").textContent=" ：取消";
            $$("wifi_connect_span").style.color="#ffffff";
            g_wifi_connect_button.textContent="WiFi连接";
        }
    }

	function camera_control (type) {
	    var move_array={left_move:{x:-20,y:0},right_move:{x:20,y:0},up_move:{x:0,y:20},down_move:{x:0,y:-20}};
	    var scan_array=[{x:2000,y:-1000},{x:-2000,y:1000},{x:500,y:-100}];
	    if(type=="scan") {
            g_mcloud_agent.test_ptz_ctrl({sn:g_selectedDevice.name,action:"test",param:"{id:1,enable:1}"},null,function(msg,ref){
                if(msg.result){
                    system_pop_confirm_box({alert:true,index:1,str:"move error: "+msg.result});
                }else{
                    g_mcloud_agent.test_ptz_ctrl({sn:g_selectedDevice.name,action:"ptz",param:"{enable:1}"},null,function(msg,ref){
                        if(msg.result){
                            system_pop_confirm_box({alert:true,index:1,str:"move error: "+msg.result});
                        }
                    })
                }
            })
         //    return;
	        // var index=0;
         //    g_mcloud_agent.test_ptz_ctrl({sn:g_selectedDevice.name,x:scan_array[index].x,y:scan_array[index].y},null,
         //        function(msg,ref){
         //            test_next();
         //            if(msg.result)
         //            {
         //                system_pop_confirm_box({alert:true,index:1,str:"move error: "+msg.result});
         //            }
         //            else
         //            {
         //                setTimeout(function(){
         //                    index++;
         //                    g_mcloud_agent.ptz_ctrl({sn:g_selectedDevice.name,x:scan_array[index].x,y:scan_array[index].y},null,
         //                        function(msg,ref){
         //                            if(msg.result)
         //                            {
         //                                system_pop_confirm_box({alert:true,index:1,str:"move error: "+msg.result})
         //                            }
         //                            else
         //                            {
         //                                setTimeout(function(){
         //                                    index++;
         //                                    g_mcloud_agent.ptz_ctrl({sn:g_selectedDevice.name,x:scan_array[index].x,y:scan_array[index].y},null,
         //                                        function(msg,ref){
         //                                            if(msg.result)
         //                                            {
         //                                                system_pop_confirm_box({alert:true,index:1,str:"move error: "+msg.result})
         //                                            }
         //                                        });
         //                                },500);
         //                            }
         //                        });
         //                },500);
         //            }
         //        });
	    } else {
	        var move=move_array[type];
            g_mcloud_agent.ptz_ctrl({sn:g_selectedDevice.name,x:move.x,y:move.y},null, function(msg,ref){
                msg.result ? system_pop_confirm_box({alert:true,index:1,str:"move error: "+msg.result}):"";});
            test_next();
	    }
	}

	function set_alarm_action(type)
	{
	    g_mcloud_agent.alarm_action_set({sn:g_selectedDevice.name,enable:0,actions:{token:"motion_alert",enable:0,name:"motion_alert",srcs:[{devs:["motion"]}],io_out_enable:1,snapshot_enable:1,record_enable:1,snapshot_interval:0,pre_record_time:3}},null,function(msg,ref){
            msg.result?system_pop_confirm_box({alert:true,index:1,str:"set_alarm_action error: "+msg.result}):
        	      (g_mcloud_agent.alarm_action_set({sn:g_selectedDevice.name,enable:type,actions:{token:"io_alert",enable:type,name:"io_alert",srcs:[{devs:["io"]}],io_out_enable:1,snapshot_enable:1,record_enable:1,snapshot_interval:0,pre_record_time:3}},null,function(msg,ref){
                    msg.result?system_pop_confirm_box({alert:true,index:1,str:"set_alarm_action error: "+msg.result}):(g_alarm_action_flag=type);
                    test_next();
                })
      )});

	}

	function auto_test () {
	    g_auto_test_flag=1;
	    g_wifi_connect_flag=1;
	    g_play_flag=0;
        set_mode ({flag:0});
        get_wifi_list (0);
        clear_test_content();
        if(g_talk_button.textContent=="对讲..") test("talk");
	    g_test_array_names.length=0;
	    g_test_array_index=0;
	    for(var i=0;i<g_test_checkbox.length;i++)
        {
            if(g_test_checkbox[i].id!="select_checkbox" && g_test_checkbox[i].checked)
            {
                g_test_array_names[g_test_array_index]=g_test_checkbox[i].id;
                g_test_array_index++;
            }
        }
        if(g_test_array_index==0) return;
        g_test_array_index=0;
        test_arra();
    }

	function test_arra() {
        var array_name=g_test_array_names[g_test_array_index];
        add_test_li(array_name,0);
        test(array_name);
	}

	function test_next() {
	    var array_name=g_test_array_names[g_test_array_index];
	    if(g_auto_test_flag) {
    	    if(g_test_arrays[array_name].quest) {
                system_pop_confirm_box({quest:g_test_arrays[array_name].quest,index:2,
                    callback_func:function(type){
                        type?add_test_li(array_name,1):add_test_li(array_name,2);
                        if(array_name=="wifi_list"&& !type) {
                            $$("wifi_connect_span").textContent="  ×";
                            $$("wifi_connect_span").style.color="#ff0000";
                            g_wifi_connect_flag=-1;
                            g_test_array_index++;
                            if(g_test_array_names[g_test_array_names.length-1]=="wifi_connect")
                            {
                                g_auto_test_flag=0;
                                g_test_button.textContent="开始测试";
                            }
                            //show_result();
                            //close_view();
                        }
                        if(array_name=="audio_out" || array_name=="audio_in"|| array_name=="talk"){
                            if(g_playing_mme&&g_playing_mme.ref_obj.inner_window_info.audio_chls)
                            {
                                g_playing_mme.chl_destroy(g_playing_mme.ref_obj.inner_window_info.audio_chls);
                                g_playing_mme.ref_obj.inner_window_info.audio_chls = null;
                                g_talk_button.textContent="对讲";
                            }
                        }
                        close_view();
                        g_test_array_index++;
                        if(g_test_array_index>=g_test_array_names.length) {show_result(); return;}
                        test_arra();
                     }
                 });
            }
            else
            {
                g_test_array_index++;
                if(g_test_array_index>=g_test_array_names.length) {show_result(); return;}
                test_arra();
            }
        }
	}

	function close_view(){
        var wifi_list_div=$$("wifi_list_div");
        if(wifi_list_div){
            wifi_list_div.style.display="none";
            g_wifi_list_flag=1;
        }
        //if(g_alarm_action_flag)set_alarm_action(0);
    }

	function add_test_li(dom,num) {
	    if(num==0)
	    {
	        $$(dom+"_span").textContent=" ：进行中..";
	        $$(dom+"_span").style.color="#ffffff";
	    }
	    if(num==1)
	    {
	        $$(dom+"_span").textContent="  √";
	        $$(dom+"_span").style.color="#A8FF24";
	    }
	    else if(num==2)
	    {
	        $$(dom+"_span").textContent="  ×";
	        $$(dom+"_span").style.color="#ff0000";
	    }
	}

	function show_result()
	{
	    if(g_test_array_names[g_test_array_names.length-1]=="wifi_connect") return;
	    g_auto_test_flag=0;
	    g_test_button.textContent="开始测试";
	}

	function clear_test_content () {
	   var test_span=g_test_ul.getElementsByTagName("span");
	   for(temp_span in test_span)
	   {
	       test_span[temp_span].textContent="";
	   }
	}
	function stop_test () {
	    if($$("system_pop_confirm_box2"))
	    {
	        var pop_confirm_box = $$("system_pop_confirm_box2"),
                pop_confirm_content = $$("system_pop_confirm_content2"),
                pop_confirm_div = $$("system_pop_confirm_div2");
            pop_confirm_box.innerHTML = "";
            pop_confirm_box.parentNode.removeChild(pop_confirm_box);
            pop_confirm_box = null;
	    }
	    var array_name=g_test_array_names[g_test_array_index];
	    if(array_name)
	    {
	        $$(array_name+"_span").textContent=" ：取消";
	        $$(array_name+"_span").style.color="#ffffff";
	    }
	    g_wifi_connect_flag=0;
        show_result();
        close_view();
	}
    function system_pop_confirm_box(obj)
    {
        var pop_confirm_box = $$("system_pop_confirm_box"+obj.index),
            pop_confirm_content, pop_confirm_div,
            client_w, client_h;
        if(!pop_confirm_box)
        {
            client_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            client_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            pop_confirm_box = dom_create_child(g_main_page_div, "div", "system_pop_confirm_box"+obj.index);
            pop_confirm_content = dom_create_child(pop_confirm_box, "div", "system_pop_confirm_cotent"+obj.index);
            pop_confirm_div = dom_create_child(pop_confirm_box, "div", "system_pop_confirm_div"+obj.index);
            pop_confirm_div.style.cssText = "position:absolute;width:" + client_w + "px;height:" + client_h + "px;background-color:#fff;opacity:0.1;"
                + "filter:alpha(opacity=10);z-index:50";
            pop_confirm_content.style.cssText = "position:absolute;top:" + ((client_h - 168) / 3) + "px;left:" + ((client_w - 286) / 2) + "px;z-index:100;"
                + "background-color: rgba(0, 0, 0, 0.8);width:286px;height:168px;"
                + "-webkit-box-shadow:0 2px 30px #050505; -moz-box-shadow:0 2px 30px #050505; box-shadow:0 2px 30px #050505;"
                +"font-family: 微软雅黑, Verdana, Arial, Helvetica, sans-serif;";
            if(obj.alert)
            {
                pop_confirm_content.innerHTML =
                     "<div style='padding-left:15px;padding-top:20px;font-size:18px;color:#EEE;text-align: center;'>" + obj.str + "</div>"
                    +"<div style='position:absolute;bottom:15px'>"
                    +   "<button id='standard_buttons_confirm' style='margin-left:100px'>确定(Enter)</button>"
                    +"</div>";

                $$("standard_buttons_confirm").onclick=function(){
                    while($$("system_pop_confirm_box"+obj.index))
                    {
                        var pop_confirm_box = $$("system_pop_confirm_box"+obj.index),
                            pop_confirm_content = $$("system_pop_confirm_content"+obj.index),
                            pop_confirm_div = $$("system_pop_confirm_div"+obj.index);
                        pop_confirm_box.innerHTML = "";
                        pop_confirm_box.parentNode.removeChild(pop_confirm_box);
                        pop_confirm_box = null;
                    }
                };
                pop_confirm_box.tabIndex=-1;
                pop_confirm_box.focus();
                pop_confirm_box.onkeydown=function(event){
                   var standard_buttons_confirm=$$("standard_buttons_confirm");
                   if(standard_buttons_confirm)
                   {
                       var e=event||window.event;
                       if(e.keyCode==13)
                           standard_buttons_confirm.click();
                   }
                };
            }
            else
            {
                pop_confirm_content.innerHTML =
                     "<div style='padding-left:15px;padding-top:20px;font-size:16px;color:#EEE'>" + obj.quest + "</div>"
                    +"<div style='position:absolute;bottom:15px'>"
                    +   "<button id='standard_buttons_green'>是(Y或B或1)</button>"
                    +   "<button id='standard_buttons_red'>否(N或2)</button>"
                    +"</div>";

                $$("standard_buttons_green").onclick=function(){
                	  g_is_find_peripheral=0;
                    var pop_confirm_box = $$("system_pop_confirm_box"+obj.index),
                        pop_confirm_content = $$("system_pop_confirm_content"+obj.index),
                        pop_confirm_div = $$("system_pop_confirm_div"+obj.index);
                    pop_confirm_box.innerHTML = "";
                    pop_confirm_box.parentNode.removeChild(pop_confirm_box);
                    pop_confirm_box = null;
                    if($$("system_pop_confirm_box1")) $$("system_pop_confirm_box1").focus();
                    obj.callback_func(1);
               };
               $$("standard_buttons_red").onclick = function() {
               	    g_is_find_peripheral=0;
                    var pop_confirm_box = $$("system_pop_confirm_box"+obj.index),
                        pop_confirm_content = $$("system_pop_confirm_content"+obj.index),
                        pop_confirm_div = $$("system_pop_confirm_div"+obj.index);
                    pop_confirm_box.innerHTML = "";
                    pop_confirm_box.parentNode.removeChild(pop_confirm_box);
                    pop_confirm_box = null;
                    if($$("system_pop_confirm_box1")) $$("system_pop_confirm_box1").focus();
                    obj.callback_func(0);
               };
               pop_confirm_box.tabIndex=-1;
               pop_confirm_box.focus();
               // pop_confirm_box.onkeydown=(function(event)
               // {
               //     var e=event||window.event;
               //     var standard_buttons_green=$$("standard_buttons_green");
               //     var standard_buttons_red=$$("standard_buttons_red");
               //
               //     if(standard_buttons_green&&standard_buttons_red)
               //     {
               //        if(e.keyCode==13)
               //             standard_buttons_green.click();
               //        else if(e.keyCode==27)
               //             standard_buttons_red.click();
               //     }
               // });

            }

        }
    }

    function upgrade() {
        system_pop_confirm_box({quest:"升级到最新版本"+g_valid_version,index:2,callback_func:function(type){
            if(type)
            {
                g_mcloud_agent.upgrade_set({sn:g_selectedDevice.name},null,function(msg,ref){
                    msg.result?system_pop_confirm_box({alert:true,index:1,str:"upgrade_set error: "+msg.result}):get_upgrade_status();
                });
                function get_upgrade_status()
                {
                    g_mcloud_agent.upgrade_get({sn:g_selectedDevice.name,check:0},null,function(msg,ref){
                        if(msg.result)
                        {
                            system_pop_confirm_box({alert:true,index:1,str:"upgrade_get error: "+msg.result});
                        }
                        else
                        {
                            var msg_status = msg.status;
                            if(msg_status == "fail")
                            {
                                system_pop_confirm_box({alert:true,index:1, str:"升级失败: "+msg.ver_extends});
                            }
                            else if(msg_status=="download")
                            {
                                g_upgrade_button.textContent = "正在升级..";
                                setTimeout(function(){get_upgrade_status();},1000);
                            }
                            else if(msg_status=="finish")
                            {
                                g_upgrade_button.textContent = "升级";
                                g_version_info_span.textContent="已是最新版本";
                                g_upgrade_button.disabled=true;
                                g_upgrade_button.style.cursor="auto";
                                system_pop_confirm_box({quest:"升级成功，需要重启后才能生效，是否重启？",index:2,callback_func:function(type){
                                if(type)
                                {
                                    g_mcloud_agent.reboot({sn:g_selectedDevice.name},null,function(msg,ref){
                                        msg.result?system_pop_confirm_box({alert:true,index:1,str:"reboot error: "+msg.result}):"";
                                    });
                                    setTimeout(function(){
                                        var fix={type:function(type){return "CcmGetDeviceRequest"},
                                               req:function(type,req){return {} },
                                               ack:function(type,ack){
                                                   var temp_ack=ack.data;
                                                   ack.length=0;
                                                   ack={data:{sn:temp_ack.SerialNumber,result:temp_ack.Result.Reason,ver:temp_ack.Version}};
                                                   return ack;
                                               }
                                        };
                                        var ip=g_selectedDevice.ip;
                                        g_mcloud_account.set_srv(ip);
                                        g_mcloud_agent.svr_dev_get(null,function(msg, ref){
                                            if(msg.result=="")
                                            {
                                                var sn=msg.sn;
                                                var index=dev_index_get(g_selectedDevice.name);
                                                dev_info_set({name:sn,version:msg.ver});
                                                g_selectedDevice=dev_get(sn);
                                                $$("device_list_li_"+index).innerHTML=sn;
                                                $$("device_list_li_"+index).title="IP："+ip+"\nVersion："+msg.ver;
                                            }
                                        });
                                    },80000);
                                }}});
                            }
                        }
                   });
                }
        }}});
    }

    function get_peripheral(){
          function loop_test_exdev(num){
              console.log("loop_test_exdev");
            if(num>40){
                add_test_li("peripheral",2);
                test_next();
                return;
            }else{
                g_mcloud_agent.exdev_get({flag:2,start:0,counts:100},null,function(msg,ref){
                    if(msg&&msg.result==""){
                       //   if(msg.data.devs){
                       //       var devs_id="";
                       //       for(var i=0,length=msg.data.devs.length;i< length;i++){
                       //       devs_id +=msg.data.devs[i].id+"&nbsp";
                       //     }
                       //     system_pop_confirm_box({alert:true,index:1,str:"外设ID:"+devs_id})
                       //     add_test_li("peripheral",1);
                       //   }else {
                       //      setTimeout(function(){loop_test_exdev(++num)},1000)
                       // }
                         if(msg.data.total){
                           add_test_li("peripheral",1);
                           test_next();
                         }else {
                            setTimeout(function(){loop_test_exdev(++num)},1000)
                       }
                    }
                });
            }
          }
    	  function exdev_discover_ack(msg,ref){
    	  	if(msg&&msg.result==""){
    	  	    loop_test_exdev(0)
    	  	}else{
                add_test_li("peripheral",2);
            }
    	  }
    	  g_is_find_peripheral=1;
        g_mcloud_agent.exdev_discover({flag:1,timeout:200*1000,interval:10,sn:g_selectedDevice.name},null,exdev_discover_ack);

    }

    function support_peripheral(){
        function support_peripheral_ack(msg,ref){
            console.log("support_peripheral_ack");
            if(msg&&msg.result=="") {
                g_mcloud_agent.hardware_test_get({sn:g_selectedDevice.name},null,function(msg,ref){
                    if(msg && msg.result=="")
                    {
                        add_test_li("support_peripheral",1);
                    }
                    else
                    {
                        add_test_li("support_peripheral",2);
                    }
                })
            }
            else
            {
                add_test_li("support_peripheral",2);
            }
        }
        g_mcloud_agent.hardware_test({sn:g_selectedDevice.name,exdev:1},null,support_peripheral_ack)
        // test_next();
    }

    function rf(){
        function loop_test_rf(num){
            if(num > 40){
                add_test_li("rf",2);
                test_next();
                return;
            }else{
               g_mcloud_agent.rf_test({sn:g_selectedDevice.name,param:"{get:1}",action:"rf"},null,function(msgs,refs){
                   // console.log("外设get",msgs,g_selectedDevice.name);
                   if(msgs&&msgs.result == ""){
                       var data_result = eval("("+msgs.data.result+")")
                       if(data_result.get && data_result.get == 1){
                           add_test_li("rf",1);
                           test_next();
                       }else{
                           if (jQuery("#test_button").html() === "开始测试"){
                               num = 100;
                           }
                           setTimeout(function(){loop_test_rf(++num)},1000);
                       }
                   }
               })
            }
        }
        // g_mcloud_agent.exdev_discover({sn:g_selectedDevice.name,flag:1,timeout:10000},null,function(msg,ref){
        //     console.log("exdev---discover=",msg);
        //     if(msg.result==""){
        //         var num = 0;
        //        var timer = setInterval(function () {
        //             g_mcloud_agent.exdev_get({sn:g_selectedDevice.name,flag:2,count: 1000},null,function(msg,ref){
        //                 console.log("exdev_get ==== ",msg);
        //                 num ++;
        //                 if (num > 10) {
        //                     clearInterval(timer);
        //                     return;
        //                 }
        //             });
        //         },1000);
        //     }
        // });
        g_mcloud_agent.rf_test({sn:g_selectedDevice.name,param:"{send:1}",action:"rf"},null,function(msg,ref){
            if(msg && msg.result==""){
                loop_test_rf(0);
            } else {
                add_test_li("rf",2);
            }
        })
    }

    function lang_set(){
        if(g_devs_ver.indexOf("v3.7.")>-1||g_devs_ver.indexOf("v3.8.")>-1){
            var select_ver = 1;
        }else{
            var select_ver = 0;
        }

        if(select_ver){
            var lang = $$("lang_select").value=="zh"?2:1;
            g_mcloud_agent.test_lang_set({type:"ccm_hardware_test",lang:lang,ver:"old"},null,function(msg,ref){
                if(msg&&msg.result==""){
                    alert("设置成功")
                }
            })
        }else{
          var lang = $$("lang_select").value;
            g_mcloud_agent.test_lang_set({type:"ccm_restore",lang:lang,ver:"new"},null,function(msg,ref){
                if(msg&&msg.result==""){
                    alert("设置成功")
                }    
            })  
        }        
    }

    window.web_test = {
        test:test
    };
})(window); 