function boxlist_func(obj){
    var _this = this;
	_this.boxlist_get = function (data){
		ms.send_msg("box_get",data,null,function (msg,ref){
            if (msg && msg.result == "") {
                var ipcs_length = msg.ipcs?msg.ipcs.length:0;
                for (var i = 0; i < ipcs_length; i++) {
                    msg.ipcs[i].nick = msg.ipcs[i].nick ? msg.ipcs[i].nick : msg.ipcs[i].sn;
                }
                data.func(msg);
            } else {
                data.func(msg);
            }
		})
	}
    _this.boxlist_img_url = function (data){
        var url = msdk_agent.pic_url_get({sn: data.sn, token: data.token});
        data.func(url);
    }
	_this.boxlist_img_get = function (data){
		var l_b64_str_array=[];
		var l_canvas_dom_array=[];
		var l_canvas_index=0;
		var c_index=0;
        l_canvas_dom_array=data.dom;
        var data_ipc_length = data.ipc?data.ipc.length:0;
		for(var i=0;i<data_ipc_length;i++){
		    var token=data.ipc[i].sn+"_"+data.resolution+"_"+Math.pow(2,31) +"_"+Math.pow(2,31);
		    if(g_local){
                var url = g_local_agent.pic_url_get({sn:data.sn,token:token,flag:2,is_history:1})               
		    }else{
		        var url = window.location.protocol + "//"+window.location.host+"/ccm/ccm_pic_get.js?dsess=1&dsess_nid="+msdk_agent.create_nid()+"&dsess_sn="+data.sn+"&dtoken="+token+"&dflag=2";
                l_canvas_dom_array[i].src = url;
		    }
		    
		}
	}
    function sdc_decode(pcomp,record_num){
        var l_data=[],l_data_index=0;
        var l_pcomp=mcodec.b64_2_binary(pcomp);
        var l_sdc_len=l_pcomp.length;
        var l_record_num=record_num;
        var l_base,l_base_len,l_pcomp_index=0;
        if (sdc_base_decode())
            return ;
        for(l_pcomp_index=l_base_len; l_pcomp_index<l_sdc_len;){
            if (sdc_group_decode()) 
                break;
        }
        return array_to_string();
        function sdc_base_decode()  /*decode the base area data解码基站数据*/
        {
            var bytes,value;
            var pbase=l_pcomp[0];
            if(l_sdc_len < 1){
                return 1;
            }
            bytes = pbase & 0xf;
            l_base_len = bytes + 1;
            l_base = pbase >> 4;
            if(bytes>0){
                if((bytes*8+4)>32){
                    l_base=big_number_operation(l_base,bytes,0);
                }else{
                    for(i=1;i<l_base_len;i++){
                        l_base |= ((l_pcomp[i]) << ((i-1) * 8 + 4));
                    }
                }
            }
            l_data[0]=l_base;
            return 0;
        }
        function sdc_group_decode()   /*decode the group area data解码组区域数据*/
        {
            var pdelta,is_compress,plen,i,pdata,value,plen_bytes;
            if(l_sdc_len < 1){
                return 1;
            }
            is_compress=(l_pcomp[l_pcomp_index]>=128); /*judge the group's first number is 1 or 0;*/
            for(i=0; i<4; i++)    /*get the item_num*/
            {
                if(i == 0){
                    plen = l_pcomp[l_pcomp_index] & 0x7f;
                }else{
                    plen =(plen << 8) | (l_pcomp[l_pcomp_index + i]);
                }
            }
            l_pcomp_index = l_pcomp_index +4;
            if(plen > l_record_num){
                return 1;
            }
            if(is_compress){
                var compress_data_delta = "";
                compress_data_delta = l_pcomp[l_pcomp_index]>> 4;
                var delta_num = l_pcomp[l_pcomp_index] & 0xf;
                var max_count = delta_num*8 +4;
                if(max_count>32){
                    var pdelta_array=big_number_operation(pdelta,delta_num,1);
                }else{
                    for (i = 0; i < delta_num; i++){
                        compress_data_delta |= ((l_pcomp[l_pcomp_index + 1 + i]) << (i * 8 + 4));
                    }
                }
                for(i=0;i<plen;i++){
                    l_data_index ++;
                    if(l_data_index >= l_record_num) return 1;
                    l_data[l_data_index]=(typeof(l_data[l_data_index -1])=="number" && !pdelta_array)?
                        (l_data[l_data_index-1]+compress_data_delta):(big_number_add(l_data[l_data_index-1],pdelta_array?pdelta_array:compress_data_delta));
                }
                l_pcomp_index = l_pcomp_index + 1 +delta_num;
            }
            if(!is_compress && (plen != 0)){
                for(i=0;i<plen;i++){
                    pdelta=l_pcomp[l_pcomp_index]>> 4;
                    var delta_num = l_pcomp[l_pcomp_index] & 0xf;

                    var max_count = delta_num*8 +4;
                    if(max_count>32){
                        var pdelta_array=big_number_operation(pdelta,delta_num,0);
                    }else{
                        for (var j = 0; j < delta_num; j++){
                            pdelta |= ((l_pcomp[l_pcomp_index + 1 + j]) << (j * 8 + 4));
                        }
                    }
                    l_data_index++;
                    if(l_data_index>=l_record_num) return 1;
                    l_data[l_data_index-1];
                    l_data[l_data_index]=(typeof(l_data[l_data_index-1])=="number" && !pdelta_array)?
                        (l_data[l_data_index-1]+pdelta):(big_number_add(l_data[l_data_index-1],pdelta_array?pdelta_array:pdelta));
                    l_pcomp_index = l_pcomp_index + 1 + delta_num;
                    pdelta = "";
                    pdelta_array = "";
                }
            }
            return 0;
        }
        function array_to_string()
        {
            for(var i=0;i<l_data.length;i++){
                if(l_data[i] instanceof Array){
                    l_data[i]="0x"+(l_data[i][0].toString(16))+(int_to_string_4(l_data[i][1]))+(int_to_string_4(l_data[i][2]))+(int_to_string_4(l_data[i][3]));
                }
            }
            return l_data;
        }
        function int_to_string_4(data_int)
        {
            var ret_data=data_int.toString(16);
            return ret_data=(ret_data.length==4)?ret_data:(ret_data.length==3)?("0"+ret_data):(ret_data.length==2)?("00"+ret_data):("000"+ret_data);
        }
        function trans_to_4(data_int)
        {
            var return_data;
            return return_data=(data_int.length==4)?data_int:(data_int.length==3)?("0"+data_int):(data_int.length==2)?("00"+data_int):("000"+data_int);
        }
        function big_number_add(num_a,num_b)
        {
            var num=[],sum;
            num_a=to_big_number(num_a);
            num_b=to_big_number(num_b);
            var num_add=[],carry_num=0;
            for(var j=3;j>-1;j--){
                var c="0x"+num_a[j].toString(16);
                var d="0x"+num_b[j].toString(16);
                num_add[j]=(parseInt(c)+parseInt(d)+(carry_num?1:0)).toString(16);
                carry_num = ("0x"+num_add[j])&0x10000;
                if(carry_num) num_add[j]=(("0x"+num_add[j])&0xffff).toString(16);
            }
            sum=("0x"+num_add[0]+(trans_to_4(num_add[1]))+(trans_to_4(num_add[2]))+(trans_to_4(num_add[3])));
            for(var i=3;i>-1;i--){
                if(sum){
                    num[i]=parseInt(sum.substring((((sum.length-4)>0)?(sum.length-4):0),sum.length),16);
                    sum=sum.substring(0,(((sum.length-4)>0)?(sum.length-4):0));
                }
                else num[i]=0;
            }
            return num;
        }
        function to_big_number(num)
        {
            var ret=[];
            if(typeof(num)=="number"){
                var tem_num=num.toString(2);
                if(tem_num.length<16){
                    return ret=[0,0,0,num];
                }else if(tem_num.length<32){
                    return ret=[0,0,num>>16,num&0xffff];
                }
            }
            else return num;
        }
        function big_number_operation(pdelta,delta_num,ptype)
        {
            var type_num=ptype?5:1;
            var tdelta=[0,0,0,pdelta];
            for (i = 0; i < delta_num; i++){
                var tcomp=l_pcomp[l_pcomp_index+type_num+i];
                var move_num=(i*8+4)+8;
                if(move_num<16){
                    tdelta[3] |= (tcomp << (move_num-8));
                }else if(move_num>16&&move_num<32){
                    if(move_num<24){
                        var digit=16-(32-move_num);
                        var tcomp_2=tcomp.toString(2);
                        tcomp_2=tcomp_2.substring(tcomp_2.length-digit,tcomp_2.length);
                        for(var j=0;j<32-move_num;j++){
                            tcomp_2+="0";
                        }
                        tdelta[3] |=parseInt(tcomp_2,2);
                        tdelta[2]|=tcomp>>(32-move_num-8);
                    }else{
                        tdelta[2] |= (tcomp << (move_num-16-8));
                    }
                }else if (move_num>32&&move_num<48){
                    if(move_num<40){
                        var digit=16-(48-move_num);
                        var tcomp_2=tcomp.toString(2);
                        tcomp_2=tcomp_2.substring(tcomp_2.length-digit,tcomp_2.length);
                        for(var j=0;j<48-move_num;j++){
                            tcomp_2+="0";
                        }
                        tdelta[2] |=parseInt(tcomp_2,2);
                        tdelta[1]|=tcomp>>(48-move_num-8);
                    }else{
                        tdelta[1] |= (tcomp << (move_num-32-8));
                    }
                }else if(move_num>48&&move_num<72){
                    if(move_num<56){
                        var digit=16-(64-move_num);
                        if(tcomp)
                            var tcomp_2=tcomp.toString(2);
                        tcomp_2=tcomp_2.substring(tcomp_2.length-digit,tcomp_2.length);
                        for(var j=0;j<64-move_num;j++){
                            tcomp_2+="0";
                        }
                        tdelta[1] |=parseInt(tcomp_2,2);
                        tdelta[0]|=tcomp>>(64-move_num-8);
                    }else{
                        tdelta[0] |= (tcomp << (move_num-48-8));
                    }
                }
            }
            return tdelta;
        }
    }
    function formatSeconds(value)
    {
        var theTime = parseInt(value);
        var theTime1 = 0;
        if(theTime > 60){
            theTime1 = parseInt(theTime/60);
            theTime = parseInt(theTime%60);
        }
        theTime = theTime>9?theTime:"0"+theTime;
        theTime1 = theTime1>9?theTime1:"0"+theTime1;
        var result = ":" + theTime;
        result = theTime1 +result;

        return result;
    }
	function cutVideo(obj){ //obj.msg就是第二次请求返回的加密数据
	    var l_local_segs= [],
	        l_segs = [],
	        local_segs_index = 0,
	        cid,sid,stm,etm,f;
	    cid=sdc_decode(obj.msg.segs_sdc.cid,obj.msg.segs_sdc.record_num); //将加密数据解析成数组，个数record_num
	    sid=sdc_decode(obj.msg.segs_sdc.sid,obj.msg.segs_sdc.record_num);
	    stm=sdc_decode(obj.msg.segs_sdc.stm,obj.msg.segs_sdc.record_num);
	    etm=sdc_decode(obj.msg.segs_sdc.etm,obj.msg.segs_sdc.record_num);
	    f=sdc_decode(obj.msg.segs_sdc.f,obj.msg.segs_sdc.record_num);
	    if(!cid || !sid || !stm || !etm || !f){
	        return;
	    }else{
	        for(var i=0;i<(cid?cid.length:0);i++){	                       
	            var flag=parseInt(f[i]);
	            var s_sid=parseInt(sid[i]);
	            l_segs[i]={cid:cid[i],sid:s_sid,stm:stm[i],etm:etm[i],f:flag}; 
	        }
        //将cid sid stm etm f这些数组的每项依次匹配形成一个数组
	    }
	    for(var i=0;i<l_segs.length;i++){
	        var video_segment_start_time = parseInt((l_segs[i].stm),16);
	        var video_segment_end_time = parseInt((l_segs[i].etm),16); 
             if(obj.search_type==0){ //如果按照时间检索在筛选视频
             //    console.log('进来了')
                // if(video_segment_start_time < obj.base_start_time) continue;//解决显示其他天日期视频问题
                 if(video_segment_start_time < obj.base_start_time||video_segment_end_time>obj.base_end_time) 
				 continue;//解决显示其他天日期视频问题
             }       
	        l_local_segs[local_segs_index]=
	        {
                cid:l_segs[i].cid,
                sid:l_segs[i].sid,
	            pos_start:video_segment_start_time,
	            pos_end:video_segment_end_time,
	            token:obj.dev_sn+"_"+l_segs[i].cid+"_"+l_segs[i].sid,
	            pic_token:obj.dev_sn+"_p3_"+l_segs[i].cid+"_"+l_segs[i].sid,
	            f:l_segs[i].f
	        };
	        local_segs_index++;
	    }
	    return l_local_segs;
	}
    /*To get the video*/
    function draw_data_rect(obj){
        var cut_video_data = [],
            cut_video_data_index = 0,
            cut_photo_data = [],
            cut_photo_data_index = 0,
            local_cut_video_data_index = 0,
            local_cut_video_data = [],
            local_video_time_duration = [],
            local_video_time_duration_index = 0,
            mark_video_segment_start_time=0,//标记视频段开始时间
            video_clip_start_time=0,//视频剪辑开始时间
            mark_alarm="",
            select_incise_time;
        var motion_flag_old = 1,
            motion_flag_new = 8,
            snapshot_flag = 2,
            io_flag = 4,
            door_flag = 16,
            sos_flag = 32;
        
        function set_flag(c,flag){
            flag = flag?flag:{};       
            flag.sos_flag = parseInt(c/sos_flag)?1:flag.sos_flag;
            flag.door_flag = parseInt((c%sos_flag)/door_flag)?1:flag.door_flag;
            flag.motion_flag = parseInt(((c%sos_flag)%door_flag)/motion_flag_new)?1:flag.motion_flag;
            flag.io_flag = parseInt((((c%sos_flag)%door_flag)%motion_flag_new)/io_flag)?1:flag.io_flag;
            flag.snapshot_flag = parseInt(((((c%sos_flag)%door_flag)%motion_flag_new)%io_flag)/snapshot_flag)?1:flag.snapshot_flag;
            flag.motion_flag = parseInt(((((c%sos_flag)%door_flag)%motion_flag_new)%io_flag)%snapshot_flag)?1:flag.motion_flag;
            return flag;
        }
        var flag = {
                sos_flag:0,
                door_flag:0,
                motion_flag:0,
                io_flag:0,
                snapshot_flag:0
            }
        if(obj.time_length == "5min"){
            select_incise_time = 5*60*1000;
        }else if(obj.time_length == "60min"){
            select_incise_time = 60*60*1000;
        }else{
            select_incise_time = 30*60*1000;
        }
        /*mark_ico mean the source of alarm, mark_ico[0] mean motion 1and8, mark_ico[1] mean snapshot 2, mark_ico[2] mean io 4, mark_ico[3] mean door 16, mark_ico[4] meansos 32*/
        function mark_alarm_info(a){
            var mark_ico=[0,0,0,0,0];
            var x=l_local_segs[a].f;
            for(var i=4;i>=0;i--)
            {
                if (x >= Math.pow(2, i+1)) {
                    mark_ico[i] = 1;
                    x = x % Math.pow(2, i);
                }
            }
            return mark_ico;
        }
        var l_local_segs = obj.videosegs, local_segs_index=obj.videosegs?obj.videosegs.length:0;
             mark_video_segment_start_time = l_local_segs[0].pos_start,
             video_clip_start_time = l_local_segs[0].pos_end;
       
        for(var j=0;j<local_segs_index;j++){
            if(obj.format==1||obj.format==0){
                if(l_local_segs[j].f>0){
                    cut_photo_data[0] = l_local_segs[j];
                    local_cut_video_data[local_cut_video_data_index]=
                    {
                        cut_video_data:cut_photo_data,
                        is_photo:1,
                        flag:set_flag(l_local_segs[j].f)
                    }
                    cut_photo_data = [];
                    local_cut_video_data_index++; 
                }
            }
            if(obj.format==2||obj.format==0){
                if(j==local_segs_index-1){
                    if(j!=0){
                        if(l_local_segs[j].f!=2 && l_local_segs[j].pos_start!=l_local_segs[j].pos_end && l_local_segs[j].pos_end-mark_video_segment_start_time< select_incise_time){
                            cut_video_data[cut_video_data_index]=l_local_segs[j];
                            cut_video_data_index++;
                        }
                    }
                }else if(j==0){
                    cut_video_data[cut_video_data_index] = l_local_segs[0];
                    cut_video_data_index++;
                }else{
					//当前一段的开始时间-前一段的结束时间
                    var end_to_start_time = Math.abs(l_local_segs[j].pos_start - l_local_segs[j-1].pos_end);
                    if(l_local_segs[j].f!=2){
                        if(l_local_segs[j].pos_start==l_local_segs[j].pos_end){
                            
                        }else if((end_to_start_time <= 7*1000)&&(l_local_segs[j].pos_end - mark_video_segment_start_time < select_incise_time)){
							//当前开始时间-之前结束时间<7s和当前结束时间-最开始开始时间<选择时间
                            cut_video_data[cut_video_data_index] = l_local_segs[j];
                            cut_video_data_index++;
                        }else{
                            if(cut_video_data.length){
                                var mark_flag = {};
                                for(var k=0;k<cut_video_data.length;k++){
                                    mark_flag = set_flag(cut_video_data[k].f,mark_flag);
                                }
                                local_cut_video_data[local_cut_video_data_index]=
                                {
                                    cut_video_data:cut_video_data,
                                    flag:mark_flag
                                }
                                local_cut_video_data_index++; 
                            }
                            cut_video_data=[];
                            cut_video_data_index = 0;
                            cut_video_data[cut_video_data_index] = l_local_segs[j];
                            cut_video_data_index++;
                            mark_video_segment_start_time = l_local_segs[j].pos_start;
                        }
                    }
                }
            }
        }
        if(cut_video_data.length)
        {
            var mark_flag = {};
            for(var k=0;k<cut_video_data.length;k++){
                mark_flag = set_flag(cut_video_data[k].f,mark_flag);
            }
            local_cut_video_data[local_cut_video_data_index]= 
            {
                cut_video_data:cut_video_data,
                flag:mark_flag
            }
            cut_video_data=[];
            cut_video_data_index = 0;
        }
        if(obj.category==1){
            var local_cut_video_data_tmp = local_cut_video_data;
            local_cut_video_data = [];
            for(var l=0;l<local_cut_video_data_tmp.length;l++){
                if(local_cut_video_data_tmp[l].flag.door_flag||local_cut_video_data_tmp[l].flag.io_flag||local_cut_video_data_tmp[l].flag.motion_flag||local_cut_video_data_tmp[l].flag.snapshot_flag||local_cut_video_data_tmp[l].flag.sos_flag){
                    local_cut_video_data.push(local_cut_video_data_tmp[l])
                }
            }      
        }
        for(var m=0;m<local_cut_video_data.length;m++)
        {
            var len = local_cut_video_data[m].cut_video_data.length;
            var video_time_duration_start = parseInt(local_cut_video_data[m].cut_video_data[0].pos_start);
            var video_time_duration_end = parseInt(local_cut_video_data[m].cut_video_data[len-1].pos_end);
            var video_time_duration = (video_time_duration_end - video_time_duration_start)/1000;
            var video_time_start = local_cut_video_data[m].cut_video_data[0].pos_start;
            var video_time_end = local_cut_video_data[m].cut_video_data[len-1].pos_end;
            local_video_time_duration[local_video_time_duration_index]=
            {
                time_duration:formatSeconds(video_time_duration),
                time_start:video_time_start,
                time_end:video_time_end
            };
            local_video_time_duration_index++;
        }
        var cutVideoData = {
			local_cut_video_data:local_cut_video_data,
			local_video_time_duration:local_video_time_duration,
		};
        return cutVideoData;
    }

    function ccm_segs_get_ack(msg,ref){//msg 第二次ccm_box_get返回的加密数据
        if( msg && !msg.result && (msg.segs_sdc||msg.segs)){
            var videosegs = cutVideo({
                msg:msg,
                base_start_time:ref.start_time,
                base_end_time:ref.end_time,
                dev_sn:ref.dev_sn,
                search_type:ref.search_type,
            });//解密成一个个seg 
            var videoData = draw_data_rect({
                videosegs:videosegs,
                time_length:ref.time_length,
                format:ref.format,
                category:ref.category,
            });//seg拼接，处理好的视频可以体现出数量 每个视频时间
            var recording_list = [];
            var data = videoData;
            for(var i = 0; i < data.local_video_time_duration.length; i++){
                recording_list[i] = {};
                recording_list[i].start_time = format(data.local_video_time_duration[i].time_start);
                recording_list[i].duration = dealSecond(data.local_video_time_duration[i].time_duration);
                recording_list[i].token = "";
            }
            for(var i = 0; i < data.local_cut_video_data.length; i++){
                var len = data.local_cut_video_data[i].cut_video_data.length;
                recording_list[i].token = ref.dev_sn+"-"+data.local_cut_video_data[i].cut_video_data[0].cid+"-"+data.local_cut_video_data[i].cut_video_data[0].sid+"-"+data.local_cut_video_data[i].cut_video_data[len-1].cid+"-"+data.local_cut_video_data[i].cut_video_data[len-1].sid+"-"+data.local_cut_video_data[i].cut_video_data[0].pic_token;
            }
            
            
            var result = new Object();
            result.data = {"result":"","recording_list":recording_list.reverse()};
            result.ref = ref;
            onEvent(JSON.stringify(result).toLowerCase())
            return;
        }
        
	}
    function format(time){
        var time = new Date(time);
        var y = time.getFullYear(); //getFullYear方法以四位数字返回年份
        var M = time.getMonth() + 1; // getMonth方法从 Date 对象返回月份 (0 ~ 11)，返回结果需要手动加一
        var d = time.getDate(); // getDate方法从 Date 对象返回一个月中的某一天 (1 ~ 31)
        var h = addZero(time.getHours()); // getHours方法返回 Date 对象的小时 (0 ~ 23)
        var m = addZero(time.getMinutes()); // getMinutes方法返回 Date 对象的分钟 (0 ~ 59)
        var s = addZero(time.getSeconds()); // getSeconds方法返回 Date 对象的秒数 (0 ~ 59)
        return ( y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s);
    }
    
    function dealSecond(time){
        var time = time.split(":");
        return time[0]*60+time[1]*1;
    }
    function addZero(time){
        time = time * 1;
        if(time<10){
            return '0'+time;
        }else{
            return time;
        }
    }
	function boxlist_device_messages_get_ack(msg,ref){
        if( msg && !msg.result&&msg.date_infos){
            var l_local_date_infos=[];
            var date_infos_time=[];
            var vedio_day=[]; //标记哪些天有视频 去了重
            var l_date_infos=msg.date_infos; //第一次知道哪些天有视频返回的日期
            var start_time,end_time,search_type,cid,sid;
            for(var i=0;i<l_date_infos.length;i++){
                var date_mis = new Date(l_date_infos[i].date * 1000).format("yyyy.MM.dd.00.00.00");
                if(i>0){
                    l_local_date_infos[l_local_date_infos.length]= date_mis;
                    date_infos_time[date_infos_time.length]= (getDateForStringDate(l_local_date_infos[l_local_date_infos.length-1])).getTime();
                }else if (i==0){
                    l_local_date_infos[i]= date_mis;
                    date_infos_time[i]= (getDateForStringDate(l_local_date_infos[i])).getTime();
                }
            }
            var nowtime=new Date().getTime(); //当前的时间 如果记录哪天有视频的返回时间超过该值，过滤掉
            for(var i=0;i<date_infos_time.length;i++){ //6.4.3 onvif录像
                if(date_infos_time[i]>nowtime){
                    continue;
                }else if(vedio_day.indexOf(date_infos_time[i])==-1){
                    vedio_day.push(date_infos_time[i]) 
                }             
            }
            vedio_day.sort(function(a,b){return a-b}); //从小到大排序
            if(ref.data.start_time==0){ 
                start_time = new Date(l_date_infos[l_date_infos.length-1].date*1000).format("yyyy.MM.dd.00.00.00");
                start_time = getDateForStringDate(start_time).getTime();
                if(start_time==-28800000){ 
                    start_time=0
                }
                end_time = start_time+60*60*24*1000; //第二次请求开始时间：最后一天凌晨 结束时间：次日凌晨 
                search_type=ref.data.search_type;
            }else{ //如果点击日期播放返回到该日期的录像
                start_time = ref.data.start_time;            
                end_time = ref.data.end_time;  
                search_type = ref.data.search_type;
            }  
            _this.history_list_get({
                box_sn:ref.data.box_sn,
                dev_sn:ref.data.dev_sn,
                start_time:start_time,
                end_time:end_time,
                date_infos_time:date_infos_time,
                format:2,
                category:0,
                time_length:"30min",
                search_type:search_type,
                cid:cid,sid:sid,
                vedio_day:vedio_day
            });
        }
	}
    _this.history_list_get = function (data){
        data.flag = 8;
        data.search_type = 0;
        data.box_sn = data.data.sn;
        data.dev_sn = data.data.sn;
        var date = data.data.date;
        date = date.split("-");
        for(var i = 1; i < date.length; i++){
            date[i] = addZero(date[i]);
        }
        date = date.join("-");
        var start_time = new Date(date).getTime()-1000*60*60*8;
        var end_time = start_time+60*60*24*1000;
        data.start_time = start_time;
        data.end_time = end_time;
        data.format = 2;
        data.category = 0;
        data.time_length = data.data.section;
        data.videoSize = data.data.duration;
        ms.send_msg("box_get",data,data,ccm_segs_get_ack);
    }
	_this.boxlist_device_messages_get = function (data){
        ms.send_msg("box_get",data.data,data,boxlist_device_messages_get_ack); 	
	}
    _this.history_img_url_get = function (data){
        data.func(window.location.protocol + "//" + window.location.host + "/ccm/ccm_pic_get.jpg?dsess=1&dsess_nid=" + msdk_agent.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + data.token + "&dflag=" + data.flag)
    }
	_this.history_img_get = function (data){
        var data = data.data;
        var img = [];
        for(var i=0;i<data.token.length;i++){ 
            ms.send_msg("pic_url_get",{sn:data.sn,token:data.token[i],flag:data.flag,is_history:1},"",function(msg,ref){
                img[i] = msg;
            });
        } 
        var result = new Object();
        result.data = {"result":"","img_src":img};
        result.ref = data;
        onEvent(JSON.stringify(result))
        return;
	}
    
}
var boxlist_func_ctrl = new boxlist_func();
g_func.push(
    {type:"boxlist_device_messages_get",login:"0",action:boxlist_func_ctrl.boxlist_device_messages_get},//第一次
    {type:"sd_recording_list",login:"0",action:boxlist_func_ctrl.history_list_get},//第二次
    {type:"history_img_get",login:"1",action:boxlist_func_ctrl.history_img_get},//图片获取
    {type:"history_img_url_get",action:boxlist_func_ctrl.history_img_url_get},
    {type:"boxlist_get",action:boxlist_func_ctrl.boxlist_get},
    {type:"boxlist_img_get",action:boxlist_func_ctrl.boxlist_img_get},
    {type:"boxlist_img_url",action:boxlist_func_ctrl.boxlist_img_url}
)
