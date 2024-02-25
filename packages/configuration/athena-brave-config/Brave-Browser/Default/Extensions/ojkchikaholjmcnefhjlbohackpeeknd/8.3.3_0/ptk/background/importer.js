/* Author: Denis Podgurskii */

export class ptk_importer {

    constructor(settings) {
        this.settings = settings
    }

    parse(text) {
        if (this['parse_' + this.settings.format]) return this['parse_' + this.settings.format](text)
        else throw 'No render methond for ' + this.settings.format
    }



    /* xml */
    parse_xml(xml) {
        let macroEvents = []
        let startUrl = null
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(xml, "text/xml")
        let events = xmlDoc.getElementsByTagName("MacroEvent")
        for (let i = 0; i < events.length; i++) {
            let item = {}
            for (let k = 0; k < events[i].children.length; k++) {
                item[events[i].children[k].nodeName] = events[i].children[k].textContent
            }
            if (i == 0) startUrl = item.Data
            macroEvents.push(item)
        }
        return [startUrl, macroEvents]
    }

    parse_side(side) {
        this.output = "";
        this.writeHeader();
        var url = side.url;
        var item = { eventDuration: BackgroundProxy.Recorder.minDuration };
        side.tests.forEach(test => {
            test.commands.forEach(cmd => {
                var cssPath = "";
                var data = cmd.value;
                cmd.targets.forEach(target => {
                    if (target[0].startsWith('css'))
                        cssPath = target[0].replace('css=', "");
                })

                switch (cmd.command) {
                    case "open":
                        this.template(item, "Navigate", url, "");
                        this.delay(item);
                        break;
                    case "click":
                        this.template(item, "Javascript", this.javascriptClickEvent("", cssPath), "");
                        //this.delay(item);
                        break;
                    case "type":
                        this.template(item, "Javascript", this.javascriptSetControlValueEvent(data, cssPath), "");
                        //this.delay(item);
                        break;
                }
            });
        });
        this.writeFooter();
        return this.output;
    }



    parse_html(html) {

    }

}