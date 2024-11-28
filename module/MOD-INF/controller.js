var logger = Packages.org.slf4j.LoggerFactory.getLogger("facet-manager");
var RefineServlet = Packages.com.google.refine.RefineServlet;
var ClientSideResourceManager = Packages.com.google.refine.ClientSideResourceManager;

function init() {
    logger.info("Initializing facet-manager extension...");
    
    try {
        RefineServlet.registerCommand(module, "facet-manager", 
            new Packages.com.google.refine.extension.facetmanager.FacetManagerController());

        ClientSideResourceManager.addPaths(
            "project/scripts",
            module,
            [
                "scripts/facet-manager.js"
            ]
        );
        
        logger.info("Facet manager extension initialization completed");
    } catch (e) {
        logger.error("Error initializing facet-manager extension: " + e);
    }
}
