const { Client } = require('pg');

exports.getResources = async (event) => {
    const client = new Client({
        host: "localhost",
        port: "5432",
        database: "workflow",
        user: "postgres",
        password: "postgres"
    });

    try {
        await client.connect();

        const projectFilter = event.queryStringParameters && event.queryStringParameters.project_id;

        const resourcesQuery = 'SELECT * FROM resources_table';
        let projectsQuery = 'SELECT * FROM projects_table';

        if (projectFilter) {
            projectsQuery += ` WHERE id = '${projectFilter}'`;
        }

        const resourcesResult = await client.query(resourcesQuery);
        const projectsResult = await client.query(projectsQuery);

        const outputData = processResourcesData(resourcesResult.rows, projectsResult.rows);

        //console.log(outputData);

        return {
            statusCode: 200,
            body: JSON.stringify(outputData),
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    } finally {
        await client.end();
    }
};

function processResourcesData(resources, projects) {
    const outputData = [];

    // Iterate over each resource
    for (const resource of resources) {
        const resourceId = resource.id;
        const resourceName = resource.resource.name;
        const resourceImgUrl = resource.resource.image;
        const resourceEmail = resource.resource.email;

        // Retrieve all projects
        const resourceProjects = projects
            .map(project => ({
                project_id: project.id,
                project_name: project.project.name,
                project_img_url: '', // Add logic to retrieve project image URL if available
            }));

        // Add the resource to the outputData array with all projects
        outputData.push({
            resource_id: resourceId,
            resource_name: resourceName,
            resource_img_url: resourceImgUrl,
            resource_email: resourceEmail,
            projects: resourceProjects,
        });
    }

    return outputData;
}
