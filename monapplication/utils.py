from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes


def get_image_tags(image_url):
    subscription_key = "a255003848c6446fba3e2953c48621f2"
    endpoint = "https://apiimg.cognitiveservices.azure.com/"

    computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))

    tags_result = computervision_client.analyze_image(image_url, visual_features=[VisualFeatureTypes.tags])
    description_result = computervision_client.describe_image(image_url)

    tags = [tag.name for tag in tags_result.tags]
    if description_result.captions:
        description = description_result.captions[0].text
    else:
        description = ""

    return tags, description

