function hook_menu(){
    $.contextMenu({
        selector: '.feeder_entry', 
        callback: function(key, options) {
            if(key == 'gallery'){
                var id = $(this).attr('specie_id');
                var folder = '';
                $.each(collection_data.species,function(){
                    if(this.id == id){
                        folder = this.name.replace(/ /g,'_').replace(/\./g,'').toLowerCase();
                        console.log(this);
                        window.open("http://soundspawn.com/browser.php?p="+folder);
                    }
                });
                console.log(this);
            } 
        },
        items: {
            "gallery": {name: "Gallery", icon: "quit"},
        }
    });
}
