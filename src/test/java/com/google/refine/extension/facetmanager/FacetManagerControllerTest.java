// FacetManagerControllerTest.java
package com.google.refine.extension.facetmanager;

import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

import java.io.StringWriter;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.google.refine.ProjectManager;

public class FacetManagerControllerTest {
    private FacetManagerController controller;
    private StringWriter stringWriter;
    private PrintWriter writer;
    
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private ProjectManager projectManager;
    
    @BeforeMethod
    public void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        controller = new FacetManagerController();
        stringWriter = new StringWriter();
        writer = new PrintWriter(stringWriter);
        
        ProjectManager.singleton = projectManager;
        when(response.getWriter()).thenReturn(writer);
        when(request.getParameter("project")).thenReturn("1234");
        when(projectManager.getProject(1234L)).thenReturn(null);
    }

    @Test
    public void testErrorResponse() throws Exception {
        controller.doPost(request, response);
        writer.flush();
        
        String output = stringWriter.toString();
        System.out.println("Actual response: " + output);
        
        assertTrue(output.contains("\"code\""), "Should contain code field");
        assertTrue(output.contains("\"error\""), "Should contain error value");
    }
}