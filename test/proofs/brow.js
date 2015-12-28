function fixVer(_ver) {
    var parts = _ver.split('.');
    var len = parts.length;
    if(len===3) { return _ver; }
    if(len<3) {
        len = 3-len;
        while(len--) { parts.push('0'); }
    } else {
        parts = parts.slice(0, 3);
    }
    return parts.join('.');
};

function Brow(name, ver) {
    if(ver) {
        this.name = name;
        this.ver  = fixVer(ver);
    } else {
        var sig = name.split(' ');
        this.name = sig[0];
        this.ver  = fixVer(sig[1]);
    }
};
