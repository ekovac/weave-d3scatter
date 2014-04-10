function weaveExternalInit()
{
    var path = JSON.parse(window.name);
    var weave_id = path.shift();
    if (window.weave == undefined)
    {
        window.weave = opener.document.getElementById(weave_id);
    }
    return window.weave.path(path).request("ExternalTool").naturalize();
}