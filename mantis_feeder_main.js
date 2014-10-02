var collection_data = null;
var collection_config = null;
var refresh_timer = null;

function load_data(){
    $.ajax({
        type: 'GET',
        url: '/mantis_feeder/get_group_data',
        success: function(data){
            collection_data = data;
            load_collection_config();
        }
    });
}

function load_collection_config(){
    $.ajax({
        type: 'GET',
        url: '/mantis_feeder/get_active_groups',
        success: function(data){
            collection_config = data;
            generate_form();
        }
    });
}

function padNumberLoop(number, length) {
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }
    return my_string;
}

function generate_form(){
    $('#content .schedule_data_table').remove();
    var table = $('<div>',{class:'schedule_data_table'});
    var row = null;
    var cell = null;
    var span = null;
    
    var buffer = (60*60*8);//Eight hours
    var deadlines = {};
    
    var due_list = [];
    $.each(collection_data.collections,function(){
        deadlines[this.frequency] = collection_data.timestamp-(this.frequency*(60*60*24));
    });
    $.each(collection_config,function(){
        var due = collection_data.collections[this.c].frequency
        if(this.l < deadlines[due]+buffer){
            due_list.push(this);
        }
    });
    for(var s in collection_data.species){
        var sp = collection_data.species[s];
        for(var c in collection_data.collections){
            var co = collection_data.collections[c];
            var valid = false;
            for(var t in collection_config){
                var te = collection_config[t];
                if(te.s == sp.id && te.c == co.id){
                    valid = true;
                    break;
                }
            }
            if(valid == false){
                continue;
            }
            
            var is_due = false;
            for(var a in due_list){
                var d = due_list[a];
                if(d.s == sp.id && d.c == co.id){
                    is_due = true;
                    break;
                }
            }
            row = $('<tr>',{class:'feeder_entry',specie_id:sp.id,collection_id:co.id,title:get_last_fed(sp.id,co.id)});
            cell = $('<td>');
            if(is_due){
                $(row).addClass('due');
            }
            span = $('<span>',{class:'name'}).html(sp.name);
            $(cell).append(span);
            span = $('<span>',{class:'common_name'}).html(sp.common_name);
            $(cell).append(span);
            span = $('<span>',{class:'collection'}).html(co.description);
            $(cell).append(span);
            $(row).append(cell);
            $(table).append(row);
        }
    }
    
    $('#content .schedule_table').append(table);
    hook_table_click();
    hook_menu();
}

function get_last_fed(sp,co){
    var t = 0;
    $.each(collection_config,function(){
        if(this.s == sp && this.c == co){
            t = this.l;
        }
    });
    if(t == 0){
        return 'Last Fed: N/A';
    }
    var d = new Date(0);
    d.setUTCSeconds(t);
    return 'Last Fed '+date_format(d);
}

function date_format(d){
    var content = '';
    var hours = d.getHours();
    var am = 'AM';
    if(hours > 12){
        hours -= 12;
        am='PM';
    }
    content += d.getMonth()+1+'/';
    content += d.getDate()+' ';
    content += hours+':';
    content += padNumberLoop(d.getMinutes(),2);
    content += am;
    
    return content;
}

function hook_table_click(){
    $('.feeder_entry').off();
    $('.feeder_entry').click(function(){
        if(confirm('Mark this group as Fed?')){
            feed_group(this);
        }
    });
}

function feed_group(t){
    $.ajax({
        type: 'POST',
        url: '/mantis_feeder/add_feed_entry',
        data: {
            specie: $(t).attr('specie_id'),
            collection: $(t).attr('collection_id'),
        },
        success: function(data){
            if(data.result){
                $(t).removeClass('due');
                load_data();
                set_timer();
            }
        },
    });
}

function set_timer(){
    clearInterval(refresh_timer);
    refresh_timer = setInterval(load_data,(5*60*1000));
}

$(document).ready(function(){
    $( document ).tooltip();
    load_data();
    set_timer();
});
