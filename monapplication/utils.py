from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes


def get_image_tags(image_url):
    subscription_key = "5d95dc53ca4b47dcac0a33590375b684"
    endpoint = "https://visionimagesazure.cognitiveservices.azure.com/"

    computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))

    try:
        features = [VisualFeatureTypes.tags, VisualFeatureTypes.description]
        image_analysis = computervision_client.analyze_image(image_url, features)

        tags = [tag.name for tag in image_analysis.tags]
        description = image_analysis.description.captions[0].text if image_analysis.description.captions else ""
    except Exception as e:
        print(f"Error getting tags and description for image: {e}")
        tags = []
        description = ""

    return tags, description

