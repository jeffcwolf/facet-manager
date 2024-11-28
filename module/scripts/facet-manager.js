$(function() {
    ExtensionBar.addExtensionMenu({
        id: "facet-manager",
        label: "Facet Manager",
        submenu: [
            {
                id: "facet-manager/import",
                label: "Import Facets",
                click: function() { FacetManager.importFacets(); }
            },
            {
                id: "facet-manager/export",
                label: "Export Facets", 
                click: function() { FacetManager.exportFacets(); }
            },
            {},  // separator
            {
                id: "facet-manager/about",
                label: "About this Extension",
                click: function() {
                    alert("Facet Manager Extension v1.0\n\n" + 
                            "Export and import OpenRefine facet configurations.\n" +
                            "Safely save your facet setups and load them into other projects.\n\n" +
                            "Supports: list, range, timerange, text, and scatterplot facets.\n" +
                            "Maximum configuration file size: 1MB\n\n" +
                            "GitHub: https://github.com/jeffcwolf/facet-manager\n" +
                            "Author: Jeffrey Wolf");
                }
            }
        ]
    });
  });
  
  var FacetManager = {
    exportFacets: function() {
         try {
             if (!ui || !ui.browsingEngine) {
                 throw new Error("OpenRefine browsing engine not available");
             }
  
             var facets = ui.browsingEngine.getFacetUIStates();
             if (!facets || !Array.isArray(facets)) {
                 throw new Error("No valid facets to export");
             }
             
             var config = {
                 facets: facets,
                 timestamp: new Date().toISOString(),
                 projectName: theProject.metadata.name,
                 version: "1.0.0"  // Add version for compatibility checking
             };
             
             var blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
             var url = URL.createObjectURL(blob);
             
             var a = document.createElement('a');
             a.href = url;
             a.download = 'facet-config.json';
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
             URL.revokeObjectURL(url);
         } catch(err) {
             console.error("Export error:", err);
             alert('Error exporting facets: ' + err.message);
         }
     },
    
     importFacets: function() {
         if (!ui || !ui.browsingEngine) {
             alert("OpenRefine browsing engine not available");
             return;
         }
  
         // Validation functions
         function validateColumns(config) {
            var projectColumns = theProject.columnModel.columns.map(col => col.name);
            config.facets.forEach(function(facet) {
                if (facet.c.columnName && !projectColumns.includes(facet.c.columnName)) {
                    throw new Error(`Column "${facet.c.columnName}" not found in project`);
                }
            });
         }

         function validateFacetConfig(config) {
             if (!config.version) {
                 console.warn("No version found in config, assuming 1.0.0");
             } else if (config.version !== "1.0.0") {
                 throw new Error("Incompatible configuration version");
             }
  
             if (!Array.isArray(config.facets)) {
                 throw new Error("Invalid configuration: facets must be an array");
             }
             
             config.facets.forEach(function(facet, index) {
                 if (!facet.c || !facet.c.type || !facet.c.name) {
                     throw new Error(`Invalid facet at index ${index}: missing required properties`);
                 }
                 // Validate facet type is allowed
                 if (!["list", "range", "timerange", "text", "scatterplot"].includes(facet.c.type)) {
                     throw new Error(`Invalid facet type "${facet.c.type}" at index ${index}`);
                 }
             });
             return true;
         }
  
         var fileInput = $('<input>')
             .attr('type', 'file')
             .attr('accept', '.json')
             .css('display', 'none')
             .on('change', function(e) {
                 var file = e.target.files[0];
                 if (file.size > 1024 * 1024) { // 1MB limit
                     alert('Configuration file too large');
                     return;
                 }
                 
                 var reader = new FileReader();
                 reader.onload = function(e) {
                     try {
                         var config = JSON.parse(e.target.result);
                         if (validateFacetConfig(config)) {
                             // Clear existing facets safely
                             try {
                                 var facets = ui.browsingEngine._facets;
                                 for (var i = facets.length - 1; i >= 0; i--) {
                                     ui.browsingEngine.removeFacet(facets[i]);
                                 }
                                 
                                 // Add each facet with error handling
                                 config.facets.forEach(function(facetState) {
                                     try {
                                         ui.browsingEngine.addFacet(
                                             facetState.c.type,
                                             facetState.c,
                                             facetState.o || {}
                                         );
                                     } catch (facetErr) {
                                         console.error("Error adding facet:", facetErr);
                                     }
                                 });
                                 
                                 ui.browsingEngine.update();
                             } catch (err) {
                                 alert('Error applying facets: ' + err.message);
                             }
                         }
                     } catch(err) {
                         console.error("Error details:", err);
                         alert('Error loading facet configuration: ' + err.message);
                     }
                 };
                 
                 reader.readAsText(file);
             });
             
         fileInput.click();
     }
  };
