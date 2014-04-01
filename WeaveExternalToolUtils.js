var WeaveExternalToolUtils = {};


WeaveExternalToolUtils.qkey_to_string = function (raw_qkey)
{
    return JSON.stringify([raw_qkey.keyType, raw_qkey.localName]);
};

WeaveExternalToolUtils.string_to_qkey = function (jsonstring)
{
    var raw_arr = JSON.parse(jsonstring);
    return {keyType: raw_arr[0], localName: raw_arr[1]};
};

WeaveExternalToolUtils.setup_properties = function (toolInterface, properties_template)
{
    var path = JSON.parse(window.name);
    var weave_id = path.shift();    
    var weave = window.document.getElementById(weave_id) || opener.document.getElementById(weave_id);

    toolInterface.properties = {};
    toolInterface.weave = weave;
    /* Shared keysets used for cross-tool integration */
    toolInterface.probe_keyset = weave.path("defaultProbeKeySet");
    toolInterface.select_keyset = weave.path("defaultSelectionKeySet");
    toolInterface.subset_keyset = weave.path("defaultSubsetKeyFilter");

    
    
    /* TODO: Test if the tool already exists and set a variable indicating we're restoring from session state */
    /* Request the base tool object */
    toolInterface.path = weave.path(path).request("ExternalTool");

    /* Dynamically create the relevant properties from the template, and bind the specified callbacks */
    for (var variableType in properties_template)
    {
        for (var variableName in properties_template[variableType])
        {
            var localPathArray = path.concat([variableName]);

            var localPath = weave.path(localPathArray).request(variableType);

            toolInterface.properties[variableName] = localPath;
        }
    }
    /* Loop over it again to add the callbacks; we can't do this in the same loop that creates it or else some things won't be ready for the first run of the callbacks. */
    for (var variableType in properties_template)
    {
        for (var variableName in properties_template[variableType])
        {
            toolInterface.properties[variableName].addCallback(properties_template[variableType][variableName], true);
        }
    }
};

WeaveExternalToolUtils.retrieve_columns = function (column_parent, column_names)
{
    var data = column_parent.libs('weave.utils.ColumnUtils').naturalize()
        .vars({names: column_names})
        .getValue("ColumnUtils.joinColumns(names.map(function(name){return getObject(name); }), null, true)");
    return data;
};

WeaveExternalToolUtils.qkey_in_keyset = function (key, keyset_path)
{
    var qkey = WeaveExternalToolUtils.string_to_qkey(key);
    var result = keyset_path.naturalize()
                .vars({localName: qkey.localName, keyType: qkey.keyType})
                .libs('weave.api.WeaveAPI')
                .getValue("containsKey(WeaveAPI.QKeyManager.getQKey(keyType, localName))");
    return result;
};
