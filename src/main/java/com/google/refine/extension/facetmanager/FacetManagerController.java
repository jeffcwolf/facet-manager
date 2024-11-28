package com.google.refine.extension.facetmanager;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.refine.ProjectManager;
import com.google.refine.commands.Command;
import com.google.refine.model.Project;
import com.google.refine.util.ParsingUtilities;

public class FacetManagerController extends Command {
    
    // Add logger definition
    static final Logger logger = LoggerFactory.getLogger("facet-manager");
    
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        try {
            Project project = getProject(request);
            
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Content-Type", "application/json");
            
            JSONWriter writer = new JSONWriter(response.getWriter());
            
            writer.object();
            
            try {
                // Your controller logic here
                writer.key("status").value("ok");
                
            } catch (Exception e) {
                logger.error("Error processing facet manager request", e);
                writer.key("status").value("error");
                writer.key("message").value(e.getMessage());
            }
            
            writer.endObject();
            
        } catch (Exception e) {
            respondException(response, e);
        }
    }
    
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        throw new ServletException("GET not implemented");
    }
    
    /**
     * Helper method to get project from request
     */
    protected Project getProject(HttpServletRequest request) throws ServletException {
        try {
            long projectId = Long.parseLong(request.getParameter("project"));
            Project project = ProjectManager.singleton.getProject(projectId);
            if (project == null) {
                throw new ServletException("Project not found");
            }
            return project;
        } catch (Exception e) {
            throw new ServletException("Error getting project", e);
        }
    }
}
