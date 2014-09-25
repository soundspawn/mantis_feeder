var collection_data = null;
var collection_config = null;

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

function generate_form(){
    $('#content .collection_data_table').remove();
    $('#collection_config_form').remove();
    var table = $('<div>',{class:'collection_data_table'});
    var row = $('<tr>');
    var cell = null;
    cell = $('<th>').html('Name');
    $(row).append(cell);
    cell = $('<th>').html('Name');
    $(row).append(cell);
    for(var j in collection_data.collections){
        cell = $('<th>').html(collection_data.collections[j].description);
        $(row).append(cell);
    }
    $(table).append(row);
    for(var i in collection_data.species){
        row = $('<tr>',{specie_id:collection_data.species[i].id});
        cell = $('<th>',{class:'specie_name'}).html(collection_data.species[i].name);
        $(row).append(cell);
        cell = $('<th>',{class:'common_name'}).html(collection_data.species[i].common_name);
        $(row).append(cell);
        for(var j in collection_data.collections){
            cell = $('<input>',{
                type: 'checkbox',
                specie_id: collection_data.species[i].id,
                collection_id: collection_data.collections[j].id,
            });
            for(var k in collection_config){
                if(collection_config[k].s == collection_data.species[i].id && collection_config[k].c == collection_data.collections[j].id){
                    cell.prop('checked',true);
                }
            }
            $(row).append($('<td>').append(cell));
        }
        $(table).append(row);
    }
    $('#content').append(table);
    table = $('<div>',{id:'collection_config_form'});
    row = $('<input>',{type:'button',id:'add_specie_btn',value:'Add Specie'});
    $(table).append(row); 
    $('#content').append(table);
    $('.collection_data_table input').off();
    $('.collection_data_table input[type=checkbox]').click(collection_config_change);
    $('.specie_name,.common_name').dblclick(edit_specie);
    $('#add_specie_btn').off().click(add_specie);
}

function add_specie(){
    $('#new_specie_id').val('0');
    $('#new_specie_add_button').val('Add Specie');
    $('#new_specie_dialog').dialog('open');
}

function edit_specie(){
    var id = $(this).parent().attr('specie_id');
    var name = $(this).parent().find('.specie_name').html();
    var common = $(this).parent().find('.common_name').html();
    
    $('#new_specie_id').val(id);
    $('#new_specie_name').val(name);
    $('#new_specie_common_name').val(common);
    $('#new_specie_add_button').val('Edit Specie');
    $('#new_specie_dialog').dialog('open');
}

function add_specie_submit(){
    $.ajax({
       type: 'POST',
       url: '/mantis_feeder/add_specie',
       data: {
           id: $('#new_specie_id').val(),
           name: $('#new_specie_name').val(),
           common_name: $('#new_specie_common_name').val(),
       },
       success: function(data){
           if(data.result == true){
               location.reload();
           }
       }
    });
}

function collection_config_change(){
    var value = $(this).prop('checked');
    $.ajax({
        type: 'POST',
        url: '/mantis_feeder/set_active_group',
        data: {
            value: value,
            specie: $(this).attr('specie_id'),
            collection: $(this).attr('collection_id'),
        },
    });
}

$(document).ready(function(){
    $('#new_specie_dialog').dialog({
        autoOpen: false,
        width: 500,
        height: 250,
    });
    $('#new_specie_add_button').click(add_specie_submit);
    load_data();
});
