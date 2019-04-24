"use strict";
   
    window.SerpstatControls = function(){
        var SerpstatControls = { 
            updateLeftRows:function(){
                if(window.serpstatAPI && window.serpstatAPI.userStats && typeof(window.serpstatAPI.userStats.left_lines)==='number'){
                    var els = document.getElementsByClassName("serpstat-api-left-rows");
                    for(var i=0;i<els.length;i++){
                        var str = window.SerpstatControls.renderInt(window.serpstatAPI.userStats.left_lines);
                        if(str != els[i].innerHTML){
                            els[i].innerHTML = str;     
                        }                    
                    }
                }
            },
            renderInt: function(x,sep){
                sep = sep || '<span style="display:inline-block; width: 0.20em; white-space: nowrap;"></span>';
                var str = ''+x;
                var aff = '';
                var arr = str.split('.');
                if(str.split('.').length===2){
                    aff = '.'+arr[1];
                    str = arr[0];
                }
                var res = '';
                for(var i=0;i<str.length;i++){
                    if(i!==0 && i!==str.length-1 && (str.length-1-i)%3 === 2){
                        res += sep;
                    }
                    res += str[i];
                }
                return res+aff;
            },
            parseToken(token){
                if(token){
                    token = token.trim()
                    if(token.length===35 && token[0]==='-' && token[1]==='-' && token[2]==='-'){
                       token = token.substr(3,token.length);
                    } 
                }
                return token;
            },
            token : function(opts){
                opts = opts || {};
                opts.leftDivClass      = opts.leftDivClass      || 'col-sm-5';
                opts.rightDivClass     = opts.rightDivClass     || 'col-sm-5';
                opts.inputClass        = opts.inputClass        || 'form-control';
                opts.inputId           = opts.inputId           || '';
                opts.errorClass        = opts.errorClass        || 'alert alert-danger';
                opts.validInputClass   = opts.validInputClass   || 'is-valid';
                opts.invalidInputClass = opts.invalidInputClass || 'is-invalid';
                
                var left = document.createElement("div");
                left.className = 'serpstat-api-token-left '+opts.leftDivClass;
                
                var input = document.createElement("input");
                input.className = 'serpstat-api-token-input '+opts.inputClass;
                if(opts.inputId){
                    input.id = opts.inputId;
                }
                input.setAttribute('type','text');
                
                input.setAttribute('placeholder',opts.lang === 'ru' ? 'Введите Токен Serpstat API' : 'Enter Serpstat API Token');
                input.setAttribute('autocorrect','off');
                input.setAttribute('autocapitalize','off');
                input.setAttribute('spellcheck','false');
                input.setAttribute('name','serpstat-api-token');
                left.appendChild(input);
                
                var right = document.createElement("div");
                right.className = 'serpstat-api-token-right '+opts.rightDivClass;

                var how   = document.createElement("div");
                how.className = 'serpstat-api-token-res serpstat-api-token-how';
                var a     = document.createElement("a");
                a.setAttribute('href',opts.lang === 'ru' ? 'https://serpstat.com/ru/api/69-kak-poluchit-sozdat-token/' : 'https://serpstat.com/api/4-how-to-get-a-token/');
                a.setAttribute('target','_blank');
                a.appendChild(document.createTextNode(opts.lang === 'ru' ? 'Как получить токен?' : 'How to get token?'));
                how.appendChild(a);
                right.appendChild(how);
                
                var ok = document.createElement("div");
                ok.className = 'serpstat-api-token-res serpstat-api-token-ok';
                ok.appendChild(document.createTextNode(opts.lang === 'ru' ? 'Осталось ' : 'Left '));
                var rows = document.createElement("span");
                rows.className = 'serpstat-api-left-rows';
                ok.appendChild(rows);
                ok.appendChild(document.createTextNode(opts.lang === 'ru' ? ' строк' :' rows'));
                ok.style.display = 'none'
                right.appendChild(ok);
                
                var err = document.createElement("div");
                err.className = 'serpstat-api-token-res serpstat-api-token-err '+opts.errorClass;
                err.style.display = 'none'
                right.appendChild(err);
                
                var wait = document.createElement("div");
                wait.className = 'serpstat-api-token-res serpstat-api-token-wait '+opts.waitClass;
                wait.style.display = 'none'
                wait.appendChild(document.createTextNode(opts.lang === 'ru' ? 'Подождите ...' :'Please wait ...'));
                right.appendChild(wait);
                
                function removeInputStateClasses(){
                    var className = ' '+input.className +' ';
                    if(opts.validInputClass){
                        className = className.split(' '+opts.validInputClass+' ').join(' ');
                    }
                    if(opts.invalidInputClass){
                        className = className.split(' '+opts.invalidInputClass+' ').join(' ');
                    }
                    input.className = className.trim().split('  ').join(' ').split('  ').join(' ');
                }
                function hideResDivs(){
                    ok.style.display  = 'none';
                    how.style.display = 'none';
                    err.style.display = 'none';
                }
                var lastVal = null;    
                function onChange(){
                    removeInputStateClasses();
                    hideResDivs();
                    var token  = input.value.trim();
                    if(!token){
                        how.style.display = 'block';
                        return;
                    }
                    lastVal = token;
                    token   = SerpstatControls.parseToken(token);
                    if(token !== lastVal){
                        input.setAttribute("type", "password");
                    }
                    var rps = 1;
                    if(typeof(opts.requestsPerSecond) === 'function'){
                        rps = opts.requestsPerSecond();
                    } else if(typeof(opts.requestsPerSecond) === 'string'){
                        if(1*rps){
                            rps = 1*rps;
                        } else {
                            rps = 1*document.getElementById(opts.requestsPerSecond).value;
                        }
                    } else {
                        rps = opts.requestsPerSecond;
                    }
                    rps = rps || 1;
                    var api = SerpstatAPI.init({
                        token   : token,
                        requestsPerSecond: rps
                    });
                    window.serpstatAPI = api;
                    if(opts.onApi){
                        opts.onApi(api);
                    }
                    api.then(function(){
                        hideResDivs();
                        removeInputStateClasses();
                        ok.style.display = 'block';
                        input.className += ' '+opts.validInputClass;
                        window.SerpstatControls.updateLeftRows();
                        if(opts.onApiSuc){
                            opts.onApiSuc(api);
                        }
                    },function(e){
                        hideResDivs();
                        removeInputStateClasses();
                        err.style.display = 'block';
                        err.innerHTML = e.message;
                        input.className += ' '+opts.invalidInputClass;
                        if(opts.onApiErr){
                            opts.onApiErr(err,api);
                        }
                    });
                }                
                setInterval(function(){
                    var val = input.value.trim();
                    if((val.length === 32||val.length === 35) && lastVal!==val){
                        onChange();
                    }
                },100);
                input.addEventListener("change",onChange);
                //input.addEventListener("paste",onChange);

                if(opts.id){
                    document.getElementById(opts.id).appendChild(left);
                    document.getElementById(opts.id).appendChild(right);
                }
                return {left:left,right:right};
            },
            defRegionsOrder:{
              en:['g_us', 'g_uk', 'g_ca', 'g_au', 'g_de', 'g_fr', 'g_it', 'g_es', 'g_ru', 'g_ua', 'g_br'],
              ru:['g_ru', 'g_ua', 'g_us', 'y_213','y_2', 'y_187','y_54','y_157','g_by']
            },
            se : function(opts){
                opts = opts || {};
                
                opts.leftDivClass      = opts.leftDivClass      || 'col-sm-5';
                opts.rightDivClass     = opts.rightDivClass     || 'col-sm-5';
                opts.textareaClass     = opts.textareaClass     || 'form-control';
                opts.textareaId        = opts.textareaId        || '';
                opts.searchClass       = opts.searchClass       || 'form-control form-control-sm';
                opts.lang              = opts.lang === 'ru' ? 'ru' : 'en';
                
                var left = document.createElement("div");
                left.className = 'serpstat-api-se-left '+opts.leftDivClass;
                
                var textarea = document.createElement("textarea");
                textarea.className = 'serpstat-api-se-textarea '+opts.textareaClass;
                textarea.setAttribute('autocorrect','off');
                textarea.setAttribute('autocapitalize','off');
                textarea.setAttribute('spellcheck','false');
                textarea.setAttribute('name','serpstat-api-se');
                if(opts.value){
                    textarea.value = opts.value;
                }
                if(opts.textareaId){
                    textarea.id = opts.textareaId;
                }
                left.appendChild(textarea);
                
                var right = document.createElement("div");
                right.className = 'serpstat-api-se-right '+opts.rightDivClass;

                var search = document.createElement("input");
                search.className = 'serpstat-api-se-search '+opts.searchClass;
                search.setAttribute('type','text');
                search.setAttribute('placeholder',opts.lang === 'ru' ? 'Поиск' : 'Search');
                right.appendChild(search);
                
                var ul = document.createElement("ul");
                ul.className = 'serpstat-api-se-ul';
                var onSearchChangeLastVal = undefined; 
                var onSearchChange = function(){
                    var val = search.value.trim().toLowerCase();
                    if(val === onSearchChangeLastVal){
                        return; 
                    }
                    onSearchChangeLastVal = val;
                    
                    var arr = SerpstatControls.findRegions(val,opts.lang);
                    while (ul.firstChild) {
                        ul.removeChild(ul.firstChild);
                    }
                    for(var i=0;i<arr.length;i++){
                        let cur = arr[i];
                        var li  = document.createElement("li");
                        var a   = document.createElement("a");
                        var txt = cur['country_name_'+opts.lang];
                        a.appendChild(document.createTextNode('+ '+txt));
                        a.setAttribute('href','javascript:void(0)');
                        a.addEventListener("click",function(){
                            var tval = textarea.value;
                            tval = tval.trim()+'\n'+cur.db_name;
                            textarea.value = tval.trim();
                            if ("createEvent" in document) {
                                var evt = document.createEvent("HTMLEvents");
                                evt.initEvent("change", false, true);
                                textarea.dispatchEvent(evt);
                            } else {
                                textarea.fireEvent("onchange");
                            }
                        });
                        li.appendChild(a);
                        ul.appendChild(li);
                    }
                };
                onSearchChange();
                search.addEventListener("change",onSearchChange);
                search.addEventListener("keyup",onSearchChange);
                search.addEventListener("input",onSearchChange);
                search.addEventListener("paste",onSearchChange);
                search.addEventListener("click",onSearchChange);
                search.addEventListener("propertychange",onSearchChange);
                
                right.appendChild(ul);
                if(opts.id){
                    document.getElementById(opts.id).appendChild(left);
                    document.getElementById(opts.id).appendChild(right);
                }
                return {left:left,right:right};
            },    
            findRegions: function(str,lang){
                lang = (lang==='ru') ? 'ru' : 'en';
                str  = (str || '').trim().toLowerCase();
                
                var res = [];
                if(str===''){
                    var order = SerpstatControls.defRegionsOrder[lang]
                    var was = {};
                    for(var i=0;i<order.length;i++){
                        was[order[i]]=1;
                        res.push(SerpstatControls.regionsById[order[i]]);
                    }
                    for(var i=0;i<SerpstatControls.regions.length;i++){
                        var cur = SerpstatControls.regions[i];
                        if(!was[cur.db_name]){
                            res.push(cur);
                        }
                    }
                    return res;
                }
                for(var i=0;i<SerpstatControls.regions.length;i++){
                    var cur   = SerpstatControls.regions[i];
                    var score = 0;
                    for(var j=0; j<cur.find.length; j++){
                        var toFind = cur.find[j];
                        if(toFind === str){
                            score = 300 + (j<3 ? 1 : 0);
                            break;
                        }
                        var index = toFind.indexOf(str);
                        if(index === 0){
                            score = 200 + (j<3 ? 1 : 0);
                        }
                        if(index !== -1 && score<100){
                            score = 100 + (j<3 ? 1 : 0);
                        }
                    }
                    if(score){
                        cur.score = score;
                        res.push(cur);
                    }
                }
                res.sort(function(a,b){
                    return b.score - a.score;
                });
                return res;
            }
        };
        var regions = [{
              "db_name": "g_ua",
              "country_name_en": "Ukraine",
              "country_name_ru": "Украина",
              "domain": "google.com.ua"
            },{
              "db_name": "g_ru",
              "country_name_en": "Russia",
              "country_name_ru": "Россия",
              "alt_names"      : "рф,российская федерация,росия",
              "domain": "google.ru"
            },{
              "db_name": "g_bg",
              "country_name_en": "Bulgaria",
              "country_name_ru": "Болгария",
              "domain": "google.bg"
            },{
              "db_name": "g_kz",
              "country_name_en": "Kazakhstan",
              "country_name_ru": "Казакстан",
              "alt_names"      : "казахстан,kazakstan,kazahstan",
              "domain": "google.kz"
            },{
              "db_name": "g_us",
              "country_name_en": "United States",
              "country_name_ru": "США",
              "alt_names"      : "United States of America,USA,соединенные штаты,соедененные штаты,соединеные штаты,соедененые штаты",
              "domain"         : "google.com"
            },{
              "db_name": "g_uk",
              "country_name_en": "United Kingdom",
              "country_name_ru": "Великобритания",
              "alt_names"      : "британия,соединенное королевство,соедененное королевство,соединеное королевство,соедененое королевство,англия",
              "domain": "google.co.uk"
            },{
              "db_name": "g_ca",
              "country_name_en": "Canada",
              "country_name_ru": "Канада",
              "domain": "google.ca"
            },{
              "db_name": "g_au",
              "country_name_en": "Australia",
              "country_name_ru": "Австралия",
              "domain": "google.com.au"
            },{
              "db_name": "g_de",
              "country_name_en": "Germany",
              "country_name_ru": "Германия",
              "domain": "google.de"
            },{
              "db_name": "g_fr",
              "country_name_en": "France",
              "country_name_ru": "Франция",
              "domain": "google.fr"
            },{
              "db_name": "g_es",
              "country_name_en": "Spain",
              "country_name_ru": "Испания",
              "domain": "google.es"
            },{
              "db_name": "g_it",
              "country_name_en": "Italy",
              "country_name_ru": "Италия",
              "domain": "google.it"
            },{
              "db_name": "g_lt",
              "country_name_en": "Lithuania",
               "country_name_ru": "Литва",
               "domain": "google.lt"
            },{
              "db_name": "g_lv",
              "country_name_en": "Latvia",
              "country_name_ru": "Латвия",
              "domain": "google.lv"
            },{
              "db_name": "g_ee",
              "country_name_en": "Estonia",
              "country_name_ru": "Эстония",
              "domain": "google.ee"
            },{
              "db_name": "g_by",
              "country_name_en": "Belarus",
              "country_name_ru": "Белоруссия",
              "alt_names"      : "Беларусь,Беларусия,Беларуссия,Белорусь,Белорусия,Белоруссия,Belarus,Belaruss,Belarussia,Belarusia,Belorus,Beloruss,Belorussia,Belorusia",
              "domain": "google.by"
            },{
              "db_name": "g_za",
              "country_name_en": "South Africa",
              "country_name_ru": "ЮАР",
              "alt_names"      : "RSA,Republic of South Africa,South Africa Republic,южно-африканская республика,южноафриканская республика,южно африканская республика",
              "domain": "google.co.za"
            },{
              "db_name": "g_nl",
              "country_name_en": "Netherlands",
              "country_name_ru": "Нидерланды",
              "alt_names"      : "Голандия,Голландия",
              "domain": "google.nl"
            },{
              "db_name": "g_br",
              "country_name_en": "Brazil",
              "country_name_ru": "Бразилия",
              "domain": "google.com.br"
            },{
              "db_name": "g_il",
              "country_name_en": "Israel",
              "country_name_ru": "Израиль",
              "domain": "google.co.il"
            },{
              "db_name": "g_dk",
              "country_name_en": "Denmark",
              "country_name_ru": "Дания",
              "domain": "google.dk"
            },{
              "db_name": "g_tr",
              "country_name_en": "Turkey",
              "country_name_ru": "Турция",
              "domain": "google.com.tr"
            },{
              "db_name": "g_se",
              "country_name_en": "Sweden",
              "country_name_ru": "Шведция",
              "domain": "google.se"
            },{
              "db_name": "g_cz",
              "country_name_en": "Czechia",
              "country_name_ru": "Чехия",
              "alt_names"      : "Czech Republic, чешская республика",
              "domain": "google.cz"
            },{
              "db_name": "g_at",
              "country_name_en": "Austria",
              "country_name_ru": "Австрия",
              "domain": "google.at"
            },{
              "db_name": "g_be",
              "country_name_en": "Belgium",
              "country_name_ru": "Бельгия",
              "domain": "google.be"
            },{
              "db_name": "g_hu",
              "country_name_en": "Hungary",
              "country_name_ru": "Венгрия",
              "domain": "google.hu"
            },{
              "db_name": "g_no",
              "country_name_en": "Norway",
              "country_name_ru": "Норвегия",
              "domain": "google.no"
            },{
              "db_name": "g_fi",
              "country_name_en": "Finland",
              "country_name_ru": "Финляндия",
              "domain": "google.fi"
            },{
              "db_name": "g_gr",
              "country_name_en": "Greece",
              "country_name_ru": "Греция",
              "domain": "google.gr"
            },{
              "db_name": "g_pl",
              "country_name_en": "Poland",
              "country_name_ru": "Польша",
              "domain": "google.pl"
            },{
              "db_name": "g_ro",
              "country_name_en": "Romania",
              "country_name_ru": "Румыния",
              "domain": "google.ro"
            },{
              "db_name": "g_pt",
              "country_name_en": "Portugal",
              "country_name_ru": "Португалия",
              "domain": "google.pt"
            },{
              "db_name": "g_ie",
              "country_name_en": "Ireland",
              "country_name_ru": "Ирландия",
              "domain": "google.ie"
            },{
              "db_name": "g_ch",
              "country_name_en": "Switzerland",
              "country_name_ru": "Швейцария",
              "domain": "google.ch"
            },{
              "db_name": "g_my",
              "country_name_en": "Malaysia",
              "country_name_ru": "Малазия",
              "domain": "google.com.my"
            },{
              "db_name": "g_sg",
              "country_name_en": "Singapore",
              "country_name_ru": "Сингапур",
              "domain": "google.com.sg"
            },{
              "db_name": "g_th",
              "country_name_en": "Thailand",
              "country_name_ru": "Тайланд",
              "domain": "google.co.th"
            },{
              "db_name": "g_si",
              "country_name_en": "Slovenia",
              "country_name_ru": "Словения",
              "domain": "google.si"
            },{
              "db_name": "g_hk",
              "country_name_en": "Hong Kong",
              "country_name_ru": "Гонг Конг",
              "domain": "google.com.hk"
            },{
              "db_name": "g_nz",
              "country_name_en": "New Zealand",
              "country_name_ru": "Новая зеландия",
              "domain": "google.co.nz"
            },{
              "db_name": "g_cl",
              "country_name_en": "Chile",
              "country_name_ru": "Чили",
              "domain": "google.cl"
            },{
              "db_name": "g_in",
              "country_name_en": "India",
              "country_name_ru": "Индия",
              "domain": "google.co.in"
            },{
              "db_name": "g_sk",
              "country_name_en": "Slovakia",
              "country_name_ru": "Словакия",
              "domain": "google.sk"
            },{
              "db_name": "g_sa",
              "country_name_en": "Saudi Arabia",
              "country_name_ru": "Саудовская Аравия",
              "domain": "google.com.sa"
            },{
              "db_name": "g_ae",
              "country_name_en": "United Arab Emirates",
              "country_name_ru": "ОАЭ",
              "alt_names"      : "UAE,Соединенные Арабские Эмираты,Соединеные Арабские Эмираты, Объединённые Арабские Эмираты, Объединенные Арабские Емираты,Объединенные Арабские Эмираты,Объединёные Арабские Эмираты, Объединеные Арабские Эмираты",
              "domain": "google.ae"
            },{
              "db_name": "g_ge",
              "country_name_en": "Georgia",
              "country_name_ru": "Грузия",
              "domain": "google.ge"
            },{
              "db_name": "g_ar",
              "country_name_en": "Argentina",
              "country_name_ru": "Аргентина",
              "domain": "google.com.ar"
            },{
              "db_name": "g_vn",
              "country_name_en": "Vietnam",
              "country_name_ru": "Вьетнам",
              "alt_names"      : "Въетнам",
              "domain": "google.com.vn"
            },{
              "db_name": "g_id",
              "country_name_en": "Indonesia",
              "country_name_ru": "Индонезия",
              "domain": "google.co.id"
            },{
              "db_name": "g_mx",
              "country_name_en": "Mexico",
              "country_name_ru": "Мексика",
              "domain": "google.com.mx"
            },{
              "db_name": "g_co",
              "country_name_en": "Colombia",
              "country_name_ru": "Колумбия",
              "domain": "google.com.co"
            },{
              "db_name": "g_ph",
              "country_name_en": "Philippines",
              "country_name_ru": "Филиппины",
              "alt_names"      : "Филипины,Филипинские острова,Филиппинские острова,Philipines",
              "domain": "google.com.ph"
            },{
              "db_name": "g_jp",
              "country_name_en": "Japan",
              "country_name_ru": "Япония",
              "domain": "google.co.jp"
            },{
              "db_name": "g_tw",
              "country_name_en": "Taiwan",
              "country_name_ru": "Тайвань",
              "domain": "google.com.tw"
            },{
              "db_name": "g_az",
              "country_name_en": "Azerbaijan",
              "country_name_ru": "Азербайджан",
              "alt_names"      : "Azerbajan,Азербайжан,Азербажан,Азербаджан",
              "domain": "google.az"
            },{
              "db_name": "g_kg",
              "country_name_en": "Kyrgyzstan", 
              "country_name_ru": "Киргизия",
              "alt_names"      : "Киргизистан,Азербайжан,Кыргызстан,Кыргызия",
              "domain": "google.kg"
            },{
              "db_name": "g_kr",
              "country_name_en": "South Korea",
              "country_name_ru": "Южная Корея",
              "alt_names"      : "Корея",
              "domain": "google.co.kr"
            },{
              "db_name": "g_pe",
              "country_name_en": "Peru",
              "country_name_ru": "Перу",
              "domain": "google.com.pe"
            },{
              "db_name": "g_hr",
              "country_name_en": "Croatia",
              "country_name_ru": "Хорватия",
              "domain": "google.hr"
            },{
              "db_name": "g_rs",
              "country_name_en": "Serbia",
              "country_name_ru": "Сербия",
              "domain": "google.rs"
            },{
              "db_name": "g_md",
              "country_name_en": "Moldova",
              "country_name_ru": "Молдова",
              "alt_names"      : "Moldavia,Moldavia,малдова,малдавия,молдавия",
              "domain": "google.md"
            },{
              "db_name": "g_ve",
              "country_name_en": "Venezuela",
              "country_name_ru": "Венесуэла",
              "alt_names"      : "Venezuella,Venisuela,Venesuela, Венесуела,Венисуэла,Венисуела,Венесуелла,Венисуэлла,Венисуелла",
              "domain": "google.co.ve"
            },{
              "db_name": "g_ec",
              "country_name_en": "Ecuador",
              "country_name_ru": "Эквадор",
              "alt_names"      : "еквадор,Ecvador,Ecvuador",
              "domain": "google.com.ec"
            },{
              "db_name": "g_ba",
              "country_name_en": "Bosnia and Herzegovina",
              "country_name_ru": "Босния и Герцеговина",
              "domain": "google.ba"
            },{
              "db_name": "g_pk",
              "country_name_en": "Pakistan",
              "country_name_ru": "Пакистан",
              "domain": "google.com.pk"
            },{
              "db_name": "g_eg",
              "country_name_en": "Egypt",
              "country_name_ru": "Египт",
              "domain": "google.com.eg"
            },{
              "db_name": "g_dz",
              "country_name_en": "Algeria",
              "country_name_ru": "Алжир",
              "domain": "google.dz"
            },{
              "db_name": "g_ma",
              "country_name_en": "Morocco",
              "country_name_ru": "Морокко",
              "alt_names"      : "Morocco,Moroco,Moroko,Morocko, Marocco,Maroco,Maroko,Marocko,морокко,мороко,марокко,мароко",
              "domain": "google.co.ma"
            },{
              "db_name": "g_bo",
              "country_name_en": "Bolivia",
              "country_name_ru": "Боливия",
              "domain": "google.com.bo"
            },{
              "db_name": "g_uy",
              "country_name_en": "Uruguay",
              "country_name_ru": "Уругвай",
              "alt_names"      : "Уруквай",
              "domain": "google.com.uy"
            },{
              "db_name": "g_tn",
              "country_name_en": "Tunisia",
              "country_name_ru": "Тунис",
              "domain": "google.tn"
            },{
              "db_name": "g_do",
              "country_name_en": "Dominican Republic",
              "country_name_ru": "Доминиканская республика",
              "domain": "google.com.do"
            },{
              "db_name": "g_cr",
              "country_name_en": "Costa Rica",
              "country_name_ru": "Коста Рика",
              "alt_names"      : "Коста-Рика,КостаРика,Косто Рика,Косто-Рика,Коста Рикo,Коста-Рико,Косто Рико,Косто-Рико",
              "domain": "google.co.cr"
            },{
              "db_name": "g_gt",
              "country_name_en": "Guatemala",
              "country_name_ru": "Гватемала",
              "alt_names"      : "Гватемалла,Гвате мала",
              "domain": "google.com.gt"
            },{
              "db_name": "g_lk",
              "country_name_en": "Sri Lanka",
              "country_name_ru": "Шри ланка",
              "alt_names"      : "Шри-ланка,Шриланка",
              "domain": "google.lk"
            },{
              "db_name": "g_is",
              "country_name_en": "Iceland",
              "country_name_ru": "Исландия",
              "domain": "google.is"
            },{
              "db_name": "g_mk",
              "country_name_en": "Macedonia (FYROM)",
              "country_name_ru": "Северная Македония",
              "alt_names"      : "Македония",
              "domain": "google.mk"
            },{
              "db_name": "g_am",
              "country_name_en": "Armenia",
              "country_name_ru": "Армения",
              "domain": "google.am"
            },{
              "db_name": "y_213",
              "country_name_en": "Yandex.Moscow",
              "country_name_ru": "Яндекс.Москва",
              "alt_names"      : "Москва,мск,msk,россия,росия,российская федерация,рф,russia",
              "domain": "yandex.ru (MSK)"
            },{ 
              "db_name": "y_2",
              "country_name_en": "Yandex.SPB",
              "country_name_ru": "Яндекс.СПБ",
              "alt_names"      : "СПБ,СанктПетербург,Санкт-Петербург,Санкт Петербург,Санкт-Питербург,Санкт Питербург, Питер",
              "domain": "yandex.ru (SPB)"
            },{
              "db_name": "y_187",
              "country_name_en": "Yandex.Ukraine",
              "country_name_ru": "Яндекс.Украина",
              "alt_names"      : "украина,ua,Ukraine",
              "domain": "yandex.ua"
            },{
              "db_name": "y_54",
              "country_name_en": "Yandex.Yekaterinburg",
              "country_name_ru": "Яндекс.Екатеринбург",
              "alt_names"      : "Екатеринбург,екб,YKB",
              "domain": "yandex.ru (YKB)"
            },{
              "db_name": "y_47",
              "country_name_en": "Yandex Nignij Novgorod",
              "country_name_ru": "Яндекс Нижний Новгород",
              "alt_names"      : "Нижний Новгород, Нижний-Новгород,Новгород,nnov",
              "domain": "yandex.ru (NNOV)"
            },{
              "db_name": "y_65",
              "country_name_en": "Yandex.Novosibirsk",
              "country_name_ru": "Яндекс.Новосибирск",
              "alt_names"      : "Новосибирск,нск,nsk",
              "domain": "yandex.ru (NSK)"
            },{
              "db_name": "y_35",
              "country_name_en": "Yandex.Krasnodar",
              "country_name_ru": "Яндекс.Краснодар",
              "alt_names"      : "Краснодар,крд,KRD",
              "domain": "yandex.ru (KRD)"
            },{
              "db_name": "y_157",
              "country_name_en": "Yandex.Minsk",
              "country_name_ru": "Яндекс.Минск",
              "alt_names"      : "минск,Беларусь,Беларусия,Беларуссия,Белорусь,Белорусия,Белоруссия,Belarus,Belaruss,Belarussia,Belarusia,Belorus,Beloruss,Belorussia,Belorusia",
              "domain": "yandex.by (MNS)"
            },{
              "db_name": "g_af",
              "country_name_en": "Afghanistan",
              "country_name_ru": "Афганистан",
              "alt_names"      : "Авганистан",
              "domain": "google.com.af"
            },{
              "db_name": "g_bd",
              "country_name_en": "Bangladesh",
              "country_name_ru": "Бангладеш",
              "alt_names"      : "Банглодеш,Бонгладеш",
              "domain": "google.com.bd"
            },{
              "db_name": "g_uz",
              "country_name_en": "Uzbekistan",
              "country_name_ru": "Узбекистан,Usbekistan",
              "domain": "google.co.uz"
            },{
              "db_name": "g_ng",
              "country_name_en": "Nigeria",
              "country_name_ru": "Нигерия",
              "domain": "google.com.ng"
            },{
              "db_name": "g_bn",
              "country_name_en": "Brunei",
              "country_name_ru": "Бруней",
              "domain": "google.com.bn"
            },{
              "db_name": "g_pa",
              "country_name_en": "Panama",
              "country_name_ru": "Панама",
              "domain": "google.com.pa"
            },{
              "db_name": "g_sv",
              "country_name_en": "El Salvador",
              "country_name_ru": "Сальвадор",
              "domain": "google.com.sv"
            },{
              "db_name": "g_py",
              "country_name_en": "Paraguay",
              "country_name_ru": "Парагвай",
              "domain": "google.com.py"
            },{
              "db_name": "g_hn",
              "country_name_en": "Honduras",
              "country_name_ru": "Гондурас",
              "alt_names"      : "Гандурас",
              "domain": "google.hn"
            },{
              "db_name": "g_ke",
              "country_name_en": "Kenya",
              "country_name_ru": "Кения",
              "domain": "google.co.ke"
            },{
              "db_name": "g_pr",
              "country_name_en": "Puerto Rico",
              "country_name_ru": "Пуэрто-Рико",
              "alt_names"      : "Пуэрто-Рико,Пуэрто Рико,ПуэртоРико,Порто-Рико,Порто Рико,ПортоРико",
              "domain": "google.com.pr"
            },{
              "db_name": "g_tt",
              "country_name_en": "Trinidad and Tobago",
              "country_name_ru": "Тринидад и Тобаго",
              "domain": "google.tt"
            },{
              "db_name": "g_jo",
              "country_name_en": "Jordan",
              "country_name_ru": "Иордания",
              "domain": "google.jo"
            },{
              "db_name": "g_mu",
              "country_name_en": "Mauritius",
              "country_name_ru": "Маврикий",
              "domain": "google.mu"
            },{
              "db_name": "g_re",
              "country_name_en": "Reunion",
              "country_name_ru": "Реюньон",
              "domain": "google.fr"
            },{
              "db_name": "g_ni",
              "country_name_en": "Nicaragua",
              "country_name_ru": "Никарагуа",
              "domain": "google.com.ni"
            },{
              "db_name": "g_jm",
              "country_name_en": "Jamaica",
              "country_name_ru": "Ямайка",
              "domain": "google.com.jm"
            },{
              "db_name": "g_iq",
              "country_name_en": "Iraq",
              "country_name_ru": "Ирак",
              "domain": "google.iq"
            },{
              "db_name": "g_ps",
              "country_name_en": "Palestine",
              "country_name_ru": "Палестина",
              "domain": "google.ps"
            },{
              "db_name": "g_gh",
              "country_name_en": "Ghana",
              "country_name_ru": "Гана",
              "domain": "google.com.gh"
            },{
              "db_name": "g_mt",
              "country_name_en": "Malta",
              "country_name_ru": "Мальта",
              "domain": "google.com.mt"
            },{
              "db_name": "g_al",
              "country_name_en": "Albania",
              "country_name_ru": "Албания",
              "domain": "google.al"
            },{
              "db_name": "g_qa",
              "country_name_en": "Qatar",
              "country_name_ru": "Катар",
              "domain": "google.com.qa"
            },{
              "db_name": "g_cy",
              "country_name_en": "Cyprus",
              "country_name_ru": "Кипр",
              "domain": "google.com.cy"
            },{
              "db_name": "g_lb",
              "country_name_en": "Lebanon",
              "country_name_ru": "Ливан",
              "domain": "google.com.lb"
            },{
              "db_name": "g_np",
              "country_name_en": "Nepal",
              "country_name_ru": "Непал",
              "domain": "google.com.np"
            },{
              "db_name": "g_zw",
              "country_name_en": "Zimbabwe",
              "country_name_ru": "Зимбабве",
              "alt_names"      : "родезия,zwe",              
              "domain": "google.co.zw"
            },{
              "db_name": "g_mg",
              "country_name_en": "Madagascar",
              "country_name_ru": "Мадагаскар",
              "domain": "google.mg"
            },{
              "db_name": "g_lu",
              "country_name_en": "Luxembourg",
              "country_name_ru": "Люксембург",
              "domain": "google.lu"
            },{
              "db_name": "g_ci",
              "country_name_en": "Cote d'Ivoire",
              "country_name_ru": "Кот-д’Ивуар",
              "alt_names"      : "берег слоновой кости, Cote dIvoire,Ivory Coast, Кот де вуар,Кот девуар,Кот-девуар,Котдевуар,Кот-де-вуар,Кот ди вуар,Котдивуар,Кот-ди-вуар",              
              "domain": "google.ci"
            },{
              "db_name": "g_cm",
              "country_name_en": "Cameroon",
              "country_name_ru": "Камерун",
              "alt_names"      : "Комерун,Comeroon,Kameroon",
              "domain": "google.cm"
            },{
              "db_name": "g_kw",
              "country_name_en": "Kuwait",
              "country_name_ru": "Кувейт",
              "alt_names"      : "Кювейт,Кьювейт,Cuwait",
              "domain": "google.com.kw"
            },{
              "db_name": "g_om",
              "country_name_en": "Oman",
              "country_name_ru": "Оман",
              "domain": "google.com.om"
            },{
              "db_name": "g_sn",
              "country_name_en": "Senegal",
              "country_name_ru": "Сенегал",
              "alt_names"      : "Сенигал,Синегал",
              "domain": "google.sn"
            },{
              "db_name": "g_ao",
              "country_name_en": "Angola",
              "country_name_ru": "Ангола",
              "domain": "google.co.ao"
            },{
              "db_name": "g_me",
              "country_name_en": "Montenegro",
              "country_name_ru": "Монтенегро",
              "alt_names"      : "Монте негро",
              "domain": "google.me"
            },{
              "db_name": "g_gp",
              "country_name_en": "Guadeloupe",
              "country_name_ru": "Гваделупа",
              "domain": "google.gp"
            },{
              "db_name": "g_mq",
              "country_name_en": "Martinique",
              "country_name_ru": "Мартиника",
              "domain": "google.com"
            },{
              "db_name": "g_ye",
              "country_name_en": "Yemen",
              "country_name_ru": "Йемен",
              "alt_names"      : "Ёмен,Йемэн,Ёмэн,Йомен",
              "domain": "google.com"
            },{
              "db_name": "g_kh",
              "country_name_en": "Cambodia",
              "country_name_ru": "Камбоджа",
              "alt_names"      : "Combodia,Kombodia,Kambodia,Камбоджия,Комбоджа,Кjмбоджия",
              "domain": "google.com.kh"
            },{
              "db_name": "g_bh",
              "country_name_en": "Bahrain",
              "country_name_ru": "Бахрейн",
              "alt_names"      : "Бохрейн,Бахрэйн,Бохрэйн",
              "domain": "google.com.bh"
            },{
              "db_name": "g_tz",
              "country_name_en": "Tanzania",
              "country_name_ru": "Танзания",
              "alt_names"      : "Тонзания,Tonzania",
              "domain": "google.co.tz"
            },{
              "db_name": "g_mz",
              "country_name_en": "Mozambique",
              "country_name_ru": "Мозамбик",
              "alt_names"      : "Мазамбик,Мозомбик,Mazambique,Mozombique",
              "domain": "google.co.mz"
            },{
              "db_name": "g_nc",
              "country_name_en": "New Caledonia",
              "country_name_ru": "Новая Каледония",
              "alt_names"      : "Каледония, Новая Коледония,Caledonia,New  Kaledonia,New  Coledonia",
              "domain": "google.com"
            },{
              "db_name": "g_ly",
              "country_name_en": "Libya",
              "country_name_ru": "Ливия",
              "domain": "google.com.ly"
            },{
              "db_name": "g_mn",
              "country_name_en": "Mongolia",
              "country_name_ru": "Монголия",
              "domain": "google.mn"
            },{
              "db_name": "g_et",
              "country_name_en": "Ethiopia",
              "country_name_ru": "Эфиопия",
              "domain": "google.com.et"
            },{
              "db_name": "g_zm",
              "country_name_en": "Zambia",
              "country_name_ru": "Замбия",
              "domain": "google.co.zm"
            },{
              "db_name": "g_na",
              "country_name_en": "Namibia",
              "country_name_ru": "Намибия",
              "domain": "google.com.na"
            },{
              "db_name": "g_pf",
              "country_name_en": "French Polynesia",
              "country_name_ru": "Французская Полинезия",
              "domain": "google.com"
            },{
              "db_name": "g_gf",
              "country_name_en": "French Guiana",
              "country_name_ru": "Французская Гвиана",
              "domain": "google.com"
            },{
              "db_name": "g_ht",
              "country_name_en": "Haiti",
              "country_name_ru": "Гаити",
              "domain": "google.ht"
            },{
              "db_name": "g_gy",
              "country_name_en": "Guyana",
              "country_name_ru": "Гайана",
              "domain": "google.gy"
            },{
              "db_name": "g_fj",
              "country_name_en": "Fiji",
              "country_name_ru": "Фиджи",
              "domain": "google.com.fj"
            },{
              "db_name": "g_bz",
              "country_name_en": "Belize",
              "country_name_ru": "Белиз",
              "domain": "google.com.bz"
            },{
              "db_name": "g_bw",
              "country_name_en": "Botswana",
              "country_name_ru": "Ботсвана",
              "domain": "google.co.bw"
            },{
              "db_name": "g_bs",
              "country_name_en": "The Bahamas",
              "country_name_ru": "Багамские Острова",
              "alt_names"      : "Bahamas,Багамы",
              "domain": "google.bs"
            },{
              "db_name": "g_ga",
              "country_name_en": "Gabon",
              "country_name_ru": "Габон",
              "domain": "google.ga"
            },{
              "db_name": "g_cd",
              "country_name_en": "Democratic Republic of the Congo",
              "country_name_ru": "Демократическая Республика Конго",
              "domain": "google.cd"
            },{
              "db_name": "g_mv",
              "country_name_en": "Maldives",
              "country_name_ru": "Мальдивы",
              "alt_names"      : "Мальдивские острова",
              "domain": "google.mv"
            },{
              "db_name": "g_yt",
              "country_name_en": "Mayotte",
              "country_name_ru": "Майотта",
              "alt_names"      : "Мойотта,Moyotte,Майота,Mayote",
              "domain": "google.com"
            },{
              "db_name": "g_sr",
              "country_name_en": "Suriname",
              "country_name_ru": "Сурианам",
              "domain": "google.sr"
            },{
              "db_name": "g_cv",
              "country_name_en": "Cape Verde",
              "country_name_ru": "Кабо-Верде",
              "alt_names"      : "Cape-Verde,CapeVerde,Кабо Верде,Кабо-Верде,КабоВерде,Капо Верде,Капо-Верде,КапоВерде",
              "domain": "google.cv"
            },{
              "db_name": "g_gu",
              "country_name_en": "Guam",
              "country_name_ru": "Гуам",
              "domain": "google.com"
            },{
              "db_name": "g_lc",
              "country_name_en": "Saint Lucia",
              "country_name_ru": "Сент-Люсия",
              "alt_names"      : "Сэнт-Люсия,Сэнт Люсия, Сант-Люсия,Сант Люсия,Санто Люсия,Санто Люция",
              "domain": "google.com"
            },{
              "db_name": "g_ag",
              "country_name_en": "Antigua and Barbuda",
              "country_name_ru": "Антигуа и Барбуда",
              "domain": "google.com.ag"
            },{
              "db_name": "g_bj",
              "country_name_en": "Benin",
              "country_name_ru": "Бенин",
              "domain": "google.bj"
            },{
              "db_name": "g_ad",
              "country_name_en": "Andorra",
              "country_name_ru": "Андорра",
              "alt_names"      : "Andora,Андора",
              "domain": "google.ad"
            },{
              "db_name": "g_rw",
              "country_name_en": "Rwanda",
              "country_name_ru": "Руанда",
              "alt_names"      : "Ruanda,Ryanda",
              "domain": "google.rw"
            },{
              "db_name": "g_la",
              "country_name_en": "Laos",
              "country_name_ru": "Лаос",
              "domain": "google.la"
            },{
              "db_name": "g_vc",
              "country_name_en": "Saint Vincent and the Grenadines",
              "country_name_ru": "Сент-Винсент и Гренадины",
              "domain": "google.com.vc"
            },{
              "db_name": "g_bf",
              "country_name_en": "Burkina Faso",
              "country_name_ru": "Буркина Фасо",
              "domain": "google.bf"
            },{
              "db_name": "g_aw",
              "country_name_en": "Aruba",
              "country_name_ru": "Аруба",
              "domain": "google.com"
            },{
              "db_name": "g_tj",
              "country_name_en": "Tajikistan",
              "country_name_ru": "Таджикистан",
              "alt_names"      : "Таджикистан,Таджикия,Тажикистан,Тажикия",
              "domain": "google.com.tj"
            },{
              "db_name": "g_gd",
              "country_name_en": "Grenada",
              "country_name_ru": "Гренада",
              "domain": "google.com"
            },{
              "db_name": "g_dj",
              "country_name_en": "Djibouti",
              "country_name_ru": "Джибути",
              "domain": "google.dj"
            },{
              "db_name": "g_tg",
              "country_name_en": "Togo",
              "country_name_ru": "Того",
              "alt_names"      : "Республика Того",
              "domain": "google.tg"
            },{
              "db_name": "g_cg",
              "country_name_en": "Republic of the Congo",
              "country_name_ru": "Республика Конго",
              "domain": "google.cg"
            },{
              "db_name": "g_mw",
              "country_name_en": "Malawi",
              "country_name_ru": "Малави",
              "domain": "google.mw"
            },{
              "db_name": "g_mr",
              "country_name_en": "Mauritania",
              "country_name_ru": "Мавритания",
              "domain": "google.com"
            },{
              "db_name": "g_mc",
              "country_name_en": "Monaco",
              "country_name_ru": "Монако",
              "alt_names"      : "Манако,Manaco",
              "domain": "google.com"
            },{
              "db_name": "g_gn",
              "country_name_en": "Guinea",
              "country_name_ru": "Гвинея",
              "domain": "google.com"
            },{
              "db_name": "g_kn",
              "country_name_en": "Saint Kitts and Nevis",
              "country_name_ru": "Сент-Китс и Невис",
              "domain": "google.com"
            },{
              "db_name": "g_ky",
              "country_name_en": "Cayman Islands",
              "country_name_ru": "Острова Кайман",
              "alt_names"      : "Каймановы Острова",
              "domain": "google.com"
            },{
              "db_name": "g_bt",
              "country_name_en": "Bhutan",
              "country_name_ru": "Бутан",
              "domain": "google.bt"
            },{
              "db_name": "g_sc",
              "country_name_en": "Seychelles",
              "country_name_ru": "Сейшельские Острова",
              "alt_names"      : "Сейшелы",
              "domain": "google.sc"
            },{
              "db_name": "g_ml",
              "country_name_en": "Mali",
              "country_name_ru": "Мали",
              "domain": "google.ml"
            },{
              "db_name": "g_fo",
              "country_name_en": "Faroe Islands",
              "country_name_ru": "Фарерские острова",
              "domain": "google.com"
            },{
              "db_name": "g_vi",
              "country_name_en": "US Virgin Islands",
              "country_name_ru": "Виргинские Острова (США)",
              "alt_names"      : "USA Virgin Islands, United States Virgin Islands, Американские Виргинские Острова",
              "domain": "google.co.vi"
            },{
              "db_name": "g_gi",
              "country_name_en": "Gibraltar",
              "country_name_ru": "Гибралтар",
              "alt_names"      : "Gibroltar,Гибролтар,Гиброалтар",
              "domain": "google.com.gi"
            },{
              "db_name": "g_ne",
              "country_name_en": "Niger",
              "country_name_ru": "Нигер",
              "domain": "google.ne"
            },{
              "db_name": "g_gq",
              "country_name_en": "Equatorial Guinea",
              "country_name_ru": "Экваториальная Гвинея",
              "domain": "google.com"
            },{
              "db_name": "y_39",
              "country_name_en": "Yandex.Rostov-on-Don",
              "country_name_ru": "Яндекс.Ростов-на-Дону",
              "alt_names"      : "Ростов-на-Дону,Ростов,Ростов на Дону",
              "domain": "yandex.ru (RND)"
            },{
              "db_name": "g_ai",
              "country_name_en": "Anguilla",
              "country_name_ru": "Ангилья",
              "alt_names"      : "Anguila",
              "domain": "google.com.ai"
            },{
              "db_name": "g_io",
              "country_name_en": "British Indian Ocean Territory",
              "country_name_ru": "Британская Территория в Индийском Океане",
              "domain": "google.com"
            },{
              "db_name": "g_vg",
              "country_name_en": "British Virgin Islands",
              "country_name_ru": "Британские Виргинские острова",
              "alt_names"      : "Виргинские острова (Великобритания)",
              "domain": "google.vg"
            },{
              "db_name": "g_td",
              "country_name_en": "Chad",
              "country_name_ru": "Чад",
              "domain": "google.td"
            },{
              "db_name": "g_ck",
              "country_name_en": "Cook Islands",
              "country_name_ru": "Острова Кука",
              "domain": "google.co.ck"
            },{
              "db_name": "g_dm",
              "country_name_en": "Dominica",
              "country_name_ru": "Доминика",
              "domain": "google.dm"
            },{
              "db_name": "g_fm",
              "country_name_en": "Federated States of Micronesia",
              "country_name_ru": "Микронезия",
              "alt_names"      : "Федеративные Штаты Микронезии",
              "domain": "google.fm"
            },{
              "db_name": "g_gm",
              "country_name_en": "The Gambia",
              "country_name_ru": "Гамбия",
              "alt_names"      : "Gambia",
              "domain": "google.gm"
            },{
              "db_name": "g_gg",
              "country_name_en": "Guernsey",
              "country_name_ru": "Гернси",
              "domain": "google.gg"
            },{
              "db_name": "g_je",
              "country_name_en": "Jersey",
              "country_name_ru": "Джерси",
              "alt_names"      : "Bailiwick of Jersey",
              "domain": "google.je"
            },{
              "db_name": "g_ki",
              "country_name_en": "Kiribati",
              "country_name_ru": "Кирибати",
              "domain": "google.ki"
            },{
              "db_name": "g_li",
              "country_name_en": "Liechtenstein",
              "country_name_ru": "Лихтенштейн",
              "domain": "google.li"
            },{
              "db_name": "g_ms",
              "country_name_en": "Montserrat",
              "country_name_ru": "Монтсеррат",
              "domain": "google.ms"
            },{
              "db_name": "g_nu",
              "country_name_en": "Niue",
              "country_name_ru": "Ниуэ",
              "domain": "google.nu"
            },{
              "db_name": "g_nf",
              "country_name_en": "Norfolk Island",
              "country_name_ru": "Норфолк",
              "domain": "google.com.nf"
            },{
              "db_name": "g_pg",
              "country_name_en": "Papua New Guinea",
              "country_name_ru": "Папуа — Новая Гвинея",
              "domain": "google.com.pg"
            },{
              "db_name": "g_pn",
              "country_name_en": "Pitcairn Islands",
              "country_name_ru": "Острова Питкэрн",
              "domain": "google.pn"
            },{
              "db_name": "g_sm",
              "country_name_en": "San Marino",
              "country_name_ru": "Сан Марино",
              "domain": "google.sm"
            },{
              "db_name": "g_st",
              "country_name_en": "Sao Tome and Principe",
              "country_name_ru": "Сан-Томе и Принсипи",
              "domain": "google.st"
            },{
              "db_name": "g_sl",
              "country_name_en": "Sierra Leone",
              "country_name_ru": "Сьерра-Леоне",
              "domain": "google.com.sl"
            },{
              "db_name": "g_sb",
              "country_name_en": "Solomon Islands",
              "country_name_ru": "Соломоновы острова",
              "domain": "google.com.sb"
            },{
              "db_name": "g_tk",
              "country_name_en": "Tokelau",
              "country_name_ru": "Токелау",
              "domain": "google.tk"
            },{
              "db_name": "g_as",
              "country_name_en": "American Samoa",
              "country_name_ru": "Американское Самое",
              "domain": "google.as"
            },{
              "db_name": "g_bi",
              "country_name_en": "Burundi",
              "country_name_ru": "Бурунди",
              "domain": "google.bi"
            },{
              "db_name": "g_cf",
              "country_name_en": "Central African Republic",
              "country_name_ru": "Центральноафриканская Республика",
              "alt_names"      : "CAR,ЦАР",              
              "domain": "google.cf"
            },{
              "db_name": "g_im",
              "country_name_en": "Isle of Man",
              "country_name_ru": "Остров Мэн",
              "domain": "google.im"
            },{
              "db_name": "g_ls",
              "country_name_en": "Lesotho",
              "country_name_ru": "Лесото",
              "domain": "google.co.ls"
            },{
              "db_name": "g_nr",
              "country_name_en": "Nauru",
              "country_name_ru": "Науру",
              "domain": "google.nr"
            },{
              "db_name": "g_ws",
              "country_name_en": "Samoa",
              "country_name_ru": "Самоа",
              "domain": "google.ws"
            },{
              "db_name": "g_so",
              "country_name_en": "Somalia",
              "country_name_ru": "Сомали",
              "domain": "google.so"
            },{
              "db_name": "g_to",
              "country_name_en": "Tonga",
              "country_name_ru": "Тонга",
              "domain": "google.to"
            },{
              "db_name": "g_ug",
              "country_name_en": "Uganda",
              "country_name_ru": "Уганда",
              "domain": "google.co.ug"
            },{
              "db_name": "g_vu",
              "country_name_en": "Vanuatu",
              "country_name_ru": "Вануату",
              "domain": "google.vu"
            },{
              "db_name": "g_cc",
              "country_name_en": "Cocos (Keeling) Islands",
              "country_name_ru": "Кокосовые острова",
              "alt_names"      : "Килинг",
              "domain": "google.com"
            },{
              "db_name": "g_gl",
              "country_name_en": "Greenland",
              "country_name_ru": "Гренландия",
              "alt_names"      : "Гринландия",
              "domain": "google.gl"
            },{
              "db_name": "g_bb",
              "country_name_en": "Barbados",
              "country_name_ru": "Барбодос",
              "alt_names"      : "Борбодос,Барбадос,Борбадос",
              "domain": "google.com"
            },{
              "db_name": "g_tl",
              "country_name_en": "Timor-Leste",
              "country_name_ru": "Восточный Тимор",
              "alt_names"      : "Тимор-лешти,Тимор-лесте",
              "domain": "google.tl"
            },{
              "db_name": "g_cn",
              "country_name_en": "China",
              "country_name_ru": "Китай",
              "domain": "google.com.hk"
            },{
              "db_name": "g_gw",
              "country_name_en": "Guinea-Bissau",
              "country_name_ru": "Гвинея-Бисау",
              "domain": "google.com"
            },{
              "db_name": "g_km",
              "country_name_en": "Comoros",
              "country_name_ru": "Коморы",
              "alt_names"      : "каморы,коморские острова",
              "domain": "google.com"
            },{
              "db_name": "g_lr",
              "country_name_en": "Liberia",
              "country_name_ru": "Либерия",
              "domain": "google.com"
            },{
              "db_name": "g_mh",
              "country_name_en": "Marshall Islands",
              "country_name_ru": "Маршалловы Острова",
              "alt_names"      : "Маршаловы Острова,Маршаллы,Маршалы",
              "domain": "google.com"
            },{
              "db_name": "g_pw",
              "country_name_en": "Palau",
              "country_name_ru": "Палау",
              "domain": "google.com"
            },{
              "db_name": "g_sz",
              "country_name_en": "Swaziland",
              "country_name_ru": "Эсватини",
              "alt_names"      : "Eswatini,свазиленд,свазиланд,свазилэнд",
              "domain": "google.com"
            },{
              "db_name": "g_tv",
              "country_name_en": "Tuvalu",
              "country_name_ru": "Тувалу",
              "alt_names"      : "Острова Элисс,Острова Элис,Ellice Islands",
              "domain": "google.com"
            },{
              "db_name": "g_tm",
              "country_name_en": "Turkmenistan",
              "country_name_ru": "Туркменистан",
              "alt_names"      : "Туркмения",
              "domain": "google.tm"
            },{
              "db_name": "g_er",
              "country_name_en": "Eritrea",
              "country_name_ru": "Эритрея",
              "domain": "google.com"
            },{
              "db_name": "g_va",
              "country_name_en": "Vatican City",
              "country_name_ru": "Ватикан",
              "domain": "google.com"
            },{
              "db_name": "g_mo",
              "country_name_en": "Macau",
              "country_name_ru": "Макау",
              "alt_names"      : "Mocau,Makau,Мокау",
              "domain": "google.com"
            },{
              "db_name": "g_cx",
              "country_name_en": "Christmas Island",
              "country_name_ru": "Остров Рождества",
              "domain": "google.com"
            },{
              "db_name": "g_bm",
              "country_name_en": "Bermuda",
              "country_name_ru": "Бермуды",
              "alt_names"      : "Бермудские Острова",
              "domain": "google.com"
            },{
              "db_name": "g_sh",
              "country_name_en": "Saint Helena, Ascension and Tristan da Cunha",
              "country_name_ru": "Святая Елена",
              "alt_names"      : "Остров святой елены,Острова Святой Елены Вознесения и Тристан-да-Кунья",
              "domain": "google.sh"
            },{
              "db_name": "g_tc",
              "country_name_en": "Turks and Caicos Islands",
              "country_name_ru": "Теркс и Кайкос",
              "domain": "google.com"
            },{
              "db_name": "g_fk",
              "country_name_en": "Falkland Islands (Islas Malvinas)",
              "country_name_ru": "Фолклендские острова",
              "alt_names"      : "Мальвинские острова,Мальвины",
              "domain": "google.com"
            },{
              "db_name": "g_mp",
              "country_name_en": "Northern Mariana Islands",
              "country_name_ru": "Северные Марианские Острова",
              "domain": "google.com"
            },{
              "db_name": "g_pm",
              "country_name_en": "Saint Pierre and Miquelon",
              "country_name_ru": "Сен-Пьер и Микелон",
              "domain": "google.com"
            },{
              "db_name": "g_wf",
              "country_name_en": "Wallis and Futuna",
              "country_name_ru": "Уоллис и Футуна",
              "domain": "google.com"
            },{
              "db_name": "g_mm",
              "country_name_en": "Myanmar (Burma)",
              "country_name_ru": "Мьянма (Бирма)",
              "alt_names"      : "Мьянма,Бирма",
              "domain": "google.com.mm"
            },{
              "db_name": "g_cw",
              "country_name_en": "Curacao",
              "country_name_ru": "Кюрасао",
              "alt_names"      : "Kuracao,курасао,Кюрасау,курасау",
              "domain": "google.com"
            }
        ];
        SerpstatControls.regions     = [];
        SerpstatControls.regionsById = {};
        for(var i=0;i<regions.length;i++){
            var cur  = regions[i];
            cur.find = {};
            cur.find[cur.country_name_en.toLowerCase().trim()] = 1;
            if(cur.db_name[0]==='g'){
                cur.find[(cur.db_name.split('_'))[1]] = 1; 
            }
            if(!cur.country_name_ru){
                alert(cur.db_name);
            }
            cur.find[cur.country_name_ru.toLowerCase().trim()] = 1;
            var arr = (cur.alt_names||'').split(',');
            for(var j=0;j<arr.length;j++){
                if(arr[j].trim()){
                    cur.find[arr[j].trim().toLowerCase()] = 1;
                }
            }
            cur.find = Object.keys(cur.find);
            SerpstatControls.regions.push(cur);
            SerpstatControls.regionsById[cur.db_name] = cur;
        }
        window.setInterval(SerpstatControls.updateLeftRows,100);
        return SerpstatControls;
    }();
    

