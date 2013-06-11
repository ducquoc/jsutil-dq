<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="/functions" prefix="fn" %>
<!DOCTYPE html>
<html lang="en">
<head>
<% String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI().substring(1), request.getContextPath()); %>
<c:set var="relativeUrl" value="${pageContext.request.contextPath}" />
<c:set var="uri" value="${pageContext.request.requestURI}" />
<c:set var="baseUri" value="${pageContext.request.scheme}://${pageContext.request.serverName}:${pageContext.request.serverPort}${pageContext.request.contextPath}" />
<c:set var="url" value="${fn:replace(pageContext.request.requestURL, pageContext.request.requestURI, '')}" />

<script type="text/javascript">
</script>
</head>

<body>

</body>
</html>
